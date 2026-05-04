package com.peakkineticspt.config;

import com.peakkineticspt.security.CloudflareAccessFilter;
import com.peakkineticspt.security.DevAuthFilter;
import com.peakkineticspt.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CloudflareAccessFilter cloudflareAccessFilter;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectProvider<DevAuthFilter> devAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                        // Public site / static
                        .requestMatchers(
                                "/",
                                "/blog/**",
                                "/reviews",
                                "/messages",
                                "/uploads/**",
                                "/images/**",
                                "/*.ico", "/*.png", "/*.svg", "/*.jpg", "/*.jpeg", "/*.webp", "/*.json", "/*.txt"
                        ).permitAll()

                        // Public APIs
                        .requestMatchers(HttpMethod.GET, "/api/reviews", "/api/reviews/**",
                                "/api/blog/**", "/api/videos", "/api/videos/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/reviews").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/messages").permitAll()

                        // Actuator (health check)
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()

                        // Auth bootstrap — public so users can establish a session
                        .requestMatchers(HttpMethod.POST,
                                "/api/admin/auth/login",
                                "/api/admin/auth/logout",
                                "/api/admin/auth/register",
                                "/api/admin/auth/forgot-password",
                                "/api/admin/auth/reset-password").permitAll()

                        // Admin and admin APIs require either CF Access JWT or
                        // app-issued JWT cookie (defense in depth)
                        .requestMatchers("/admin/**", "/api/admin/**", "/api/upload/**").authenticated()
                        .requestMatchers("/api/reviews/admin/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/reviews/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/reviews/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").authenticated()

                        // Default: anything else not matched is permitted (marketing routes)
                        .anyRequest().permitAll())

                .addFilterBefore(cloudflareAccessFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(jwtAuthenticationFilter, CloudflareAccessFilter.class)

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)));

        // Local-dev only: if DevAuthFilter bean is present, run it before everything else
        // so requests arrive pre-authenticated. Bean is conditional on dev.auto-auth.enabled=true.
        DevAuthFilter dev = devAuthFilter.getIfAvailable();
        if (dev != null) {
            http.addFilterBefore(dev, CloudflareAccessFilter.class);
        }

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
