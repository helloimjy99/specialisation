package com.tmsgrp3.backend.security;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.tmsgrp3.backend.ConfigProperties;
import com.tmsgrp3.backend.security.filter.AuthFilter;
import com.tmsgrp3.backend.security.filter.ExceptionHandlerFilter;
import com.tmsgrp3.backend.security.filter.JWTAuthFilter;
import com.tmsgrp3.backend.security.manager.CustomAuthManager;
import com.tmsgrp3.backend.service.BackendService;

import lombok.AllArgsConstructor;

@Configuration
@AllArgsConstructor
public class SecurityConfig {
    
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    CustomAuthManager customAuthManager;

    @Autowired
    BackendService service;

    @Autowired
    ConfigProperties config;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        AuthFilter auth_filter = new AuthFilter(customAuthManager, service, config);
        auth_filter.setFilterProcessesUrl("/login");

        System.out.println("starting up");
        http
            .csrf((csrf) -> csrf.disable())
            .cors((cors) -> cors.configurationSource(corsConfigurationSource()))
            /*.authorizeHttpRequests((req) -> 
                req
                    .requestMatchers(HttpMethod.POST, "/*").permitAll()
            )*/
            //.httpBasic(Customizer.withDefaults())
            .addFilterBefore(new ExceptionHandlerFilter(), AuthFilter.class)
            .addFilter(auth_filter)
            .addFilterAfter(new JWTAuthFilter(), AuthFilter.class)
            .sessionManagement((session) ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        return http.build();
    }

    @Bean 
    CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("*"));
        config.setAllowedHeaders(Arrays.asList("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
