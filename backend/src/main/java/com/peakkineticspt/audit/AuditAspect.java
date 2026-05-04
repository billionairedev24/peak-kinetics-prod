package com.peakkineticspt.audit;

import com.peakkineticspt.entity.AuditLog;
import com.peakkineticspt.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.MDC;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;

@Aspect
@Component
@EnableAsync
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogRepository auditLogRepository;

    @Around("@annotation(com.peakkineticspt.audit.Auditable)")
    public Object audit(ProceedingJoinPoint pjp) throws Throwable {
        MethodSignature sig = (MethodSignature) pjp.getSignature();
        Auditable ann = sig.getMethod().getAnnotation(Auditable.class);
        String action = ann.action();
        String entityType = ann.entityType();

        String outcome = "SUCCESS";
        Throwable thrown = null;
        Object result = null;
        try {
            result = pjp.proceed();
            return result;
        } catch (Throwable t) {
            outcome = "FAILURE";
            thrown = t;
            throw t;
        } finally {
            try {
                writeAuditAsync(action, entityType, outcome);
            } catch (Exception e) {
                log.warn("Audit log write failed for action={}", action, e);
            }
        }
    }

    @Async
    protected void writeAuditAsync(String action, String entityType, String outcome) {
        String userEmail = null;
        Long userId = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserDetails ud) {
            userEmail = ud.getUsername();
        }

        String ip = null;
        String ua = null;
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest req = attrs.getRequest();
            ip = clientIp(req);
            ua = req.getHeader("User-Agent");
            if (ua != null && ua.length() > 512) ua = ua.substring(0, 512);
        }

        AuditLog entry = AuditLog.builder()
                .userId(userId)
                .userEmail(userEmail)
                .action(action)
                .entityType(entityType == null || entityType.isBlank() ? null : entityType)
                .ipAddress(ip)
                .userAgent(ua)
                .requestId(MDC.get("requestId"))
                .timestamp(Instant.now())
                .outcome(outcome)
                .build();

        auditLogRepository.save(entry);
    }

    private static String clientIp(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        if (fwd != null && !fwd.isBlank()) {
            int comma = fwd.indexOf(',');
            return (comma > 0 ? fwd.substring(0, comma) : fwd).trim();
        }
        return req.getRemoteAddr();
    }
}
