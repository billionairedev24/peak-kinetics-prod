package com.peakkineticspt.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final UserDetailsService userDetailsService;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

                http
                                // ----------------------------
                                // BASICS
                                // ----------------------------
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(Customizer.withDefaults())

                                // ----------------------------
                                // AUTHORIZATION
                                // ----------------------------
                                .authorizeHttpRequests(auth -> auth

                                                // -------- Next.js internals (CRITICAL) --------
                                                .requestMatchers(
                                                                "/_next/**",
                                                                "/**/__next._tree.txt",
                                                                "/**/__next._rsc**")
                                                .permitAll()

                                                // -------- Static assets --------
                                                .requestMatchers(
                                                                "/images/**",
                                                                "/uploads/**",
                                                                "/*.ico",
                                                                "/*.png",
                                                                "/*.svg",
                                                                "/*.jpg",
                                                                "/*.jpeg",
                                                                "/*.webp",
                                                                "/*.json",
                                                                "/*.txt")
                                                .permitAll()

                                                // -------- Public admin UI pages --------
                                                .requestMatchers(
                                                                "/admin/login",
                                                                "/admin/login/**",
                                                                "/admin/register",
                                                                "/admin/register/**",
                                                                "/admin/forgot-password",
                                                                "/admin/forgot-password/**",
                                                                "/admin/reset-password",
                                                                "/admin/reset-password/**")
                                                .permitAll()

                                                // -------- Public auth APIs --------
                                                .requestMatchers(
                                                                "/auth/login",
                                                                "/api/admin/auth/register",
                                                                "/api/admin/auth/forgot-password",
                                                                "/api/admin/auth/reset-password")
                                                .permitAll()

                                                // -------- Public site pages --------
                                                .requestMatchers(
                                                                "/",
                                                                "/blog/**",
                                                                "/reviews",
                                                                "/messages")
                                                .permitAll()

                                                // -------- Actuator (lock down in prod) --------
                                                .requestMatchers("/actuator/**").permitAll()

                                                // -------- Reviews API (GET public, write protected) --------
                                                .requestMatchers(HttpMethod.GET, "/api/reviews", "/api/reviews/**")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/reviews").permitAll()
                                                .requestMatchers("/api/reviews/admin/**").authenticated()
                                                .requestMatchers(HttpMethod.POST, "/api/reviews/**").authenticated()
                                                .requestMatchers(HttpMethod.PUT, "/api/reviews/**").authenticated()
                                                .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").authenticated()
                                                .requestMatchers(HttpMethod.POST, "/api/messages").permitAll()
                                                .requestMatchers(HttpMethod.GET, "/api/blog/**", "/api/videos",
                                                                "/api/videos/**")
                                                .permitAll()

                                                // -------- Protected areas --------
                                                .requestMatchers("/logout").authenticated()
                                                .requestMatchers("/api/upload").authenticated()
                                                .requestMatchers("/admin/**").authenticated()
                                                .requestMatchers("/api/**").authenticated()

                                                // -------- Everything else --------
                                                .anyRequest().permitAll())

                                // ----------------------------
                                // HEADERS (H2 / iframe support)
                                // ----------------------------
                                .headers(headers -> headers
                                                .frameOptions(frame -> frame.disable()))

                                // ----------------------------
                                // FORM LOGIN
                                // ----------------------------
                                .formLogin(form -> form
                                                .loginPage("/admin/login")
                                                .loginProcessingUrl("/admin/login")
                                                .successHandler(authenticationSuccessHandler())
                                                .failureUrl("/admin/login?error"))

                                // ----------------------------
                                // LOGOUT (AUTH REQUIRED)
                                // ----------------------------
                                .logout(logout -> logout
                                                .logoutUrl("/logout")
                                                .logoutSuccessUrl("/admin/login?logout")
                                                .invalidateHttpSession(true)
                                                .deleteCookies("JSESSIONID", "SESSION"))

                                // ----------------------------
                                // EXCEPTION HANDLING
                                // ----------------------------
                                .exceptionHandling(ex -> ex
                                                // API → 401 JSON
                                                .defaultAuthenticationEntryPointFor(
                                                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                                                request -> request.getRequestURI().startsWith("/api/"))
                                                // Browser → redirect to login
                                                .authenticationEntryPoint(
                                                                new LoginUrlAuthenticationEntryPoint("/admin/login")))

                                // ----------------------------
                                // USER DETAILS
                                // ----------------------------
                                .userDetailsService(userDetailsService)

                                // ----------------------------
                                // SESSION MANAGEMENT
                                // ----------------------------
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                                                .maximumSessions(1));

                return http.build();
        }

        // ----------------------------
        // PASSWORD ENCODER
        // ----------------------------
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        // ----------------------------
        // AUTH MANAGER
        // ----------------------------
        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration authConfig) throws Exception {
                return authConfig.getAuthenticationManager();
        }

        @Bean
        public AuthenticationSuccessHandler authenticationSuccessHandler() {
                return (request, response, authentication) -> {
                        response.sendRedirect("/admin");
                };
        }

}