package com.mypes.platform.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

        @Autowired
        private JwtFilter jwtFilter;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http)
                        throws Exception {

                http
                                .cors(Customizer.withDefaults())
                                .csrf(csrf -> csrf.disable())

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                .authorizeHttpRequests(auth -> auth

                                                .requestMatchers(
                                                                "/auth/login",
                                                                "/auth/register",
                                                                "/api/tienda/listar",
                                                                "/productos/listar",
                                                                "/productos/buscar",
                                                                "/api/imagen/**",
                                                                "/uploads/**",
                                                                "/vista/**",
                                                                "/css/**",
                                                                "/js/**")
                                                .permitAll()

                                                .requestMatchers(HttpMethod.GET, "/productos/check-admin")
                                                .authenticated()

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/tienda/mi-tienda",
                                                                "/productos/mi-tienda")
                                                .hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.POST, "/productos/guardar")
                                                .hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.PUT, "/productos/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.POST, "/api/tienda/guardar")
                                                .hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.PUT, "/api/tienda/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers("/admin/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers("/usuario/**")
                                                .hasAnyRole(
                                                                "CLIENTE",
                                                                "ADMIN")

                                                .anyRequest()
                                                .authenticated())

                                .addFilterBefore(
                                                jwtFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("http://localhost:4200"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }
}