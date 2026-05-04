package com.peakkineticspt.audit;

import com.peakkineticspt.entity.AuditLog;
import com.peakkineticspt.repository.AuditLogRepository;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.reflect.MethodSignature;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.MDC;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditAspectTest {

    @Mock
    AuditLogRepository repository;

    @Mock
    ProceedingJoinPoint joinPoint;

    @Mock
    MethodSignature signature;

    AuditAspect aspect;

    @BeforeEach
    void setup() {
        aspect = new AuditAspect(repository);
    }

    @AfterEach
    void teardown() {
        MDC.clear();
    }

    @Test
    void successfulCall_writesSuccessAuditEntry() throws Throwable {
        Method method = SampleAudited.class.getMethod("doThing");
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getMethod()).thenReturn(method);
        when(joinPoint.proceed()).thenReturn("ok");

        Object result = aspect.audit(joinPoint);

        assertThat(result).isEqualTo("ok");
        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(repository).save(captor.capture());
        AuditLog saved = captor.getValue();
        assertThat(saved.getAction()).isEqualTo("DO_THING");
        assertThat(saved.getEntityType()).isEqualTo("Thing");
        assertThat(saved.getOutcome()).isEqualTo("SUCCESS");
        assertThat(saved.getTimestamp()).isNotNull();
    }

    @Test
    void exceptionInBusinessMethod_writesFailureAndRethrows() throws Throwable {
        Method method = SampleAudited.class.getMethod("doThing");
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getMethod()).thenReturn(method);
        when(joinPoint.proceed()).thenThrow(new IllegalStateException("boom"));

        assertThatThrownBy(() -> aspect.audit(joinPoint))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("boom");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getOutcome()).isEqualTo("FAILURE");
    }

    @Test
    void requestIdFromMdc_isCaptured() throws Throwable {
        MDC.put("requestId", "rid-abc-123");
        Method method = SampleAudited.class.getMethod("doThing");
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getMethod()).thenReturn(method);
        when(joinPoint.proceed()).thenReturn(null);

        aspect.audit(joinPoint);

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getRequestId()).isEqualTo("rid-abc-123");
    }

    @Test
    void blankEntityType_savedAsNull() throws Throwable {
        Method method = SampleAudited.class.getMethod("doActionOnly");
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getMethod()).thenReturn(method);
        when(joinPoint.proceed()).thenReturn(null);

        aspect.audit(joinPoint);

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getEntityType()).isNull();
        assertThat(captor.getValue().getAction()).isEqualTo("LOGIN");
    }

    @Test
    void repositoryFailure_doesNotMaskBusinessResult() throws Throwable {
        Method method = SampleAudited.class.getMethod("doThing");
        when(joinPoint.getSignature()).thenReturn(signature);
        when(signature.getMethod()).thenReturn(method);
        when(joinPoint.proceed()).thenReturn("the result");
        doThrow(new RuntimeException("db down")).when(repository).save(any(AuditLog.class));

        Object result = aspect.audit(joinPoint);

        assertThat(result).isEqualTo("the result");
    }

    static class SampleAudited {
        @Auditable(action = "DO_THING", entityType = "Thing")
        public String doThing() { return "x"; }

        @Auditable(action = "LOGIN")
        public void doActionOnly() {}
    }
}
