package com.tmsgrp3.backend.security.filter;

import java.io.IOException;
import java.util.Date;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tmsgrp3.backend.ConfigProperties;
import com.tmsgrp3.backend.entities.TMSUser;
import com.tmsgrp3.backend.security.manager.CustomAuthManager;
import com.tmsgrp3.backend.service.BackendService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public class AuthFilter extends UsernamePasswordAuthenticationFilter {
    
    private CustomAuthManager authManager;
    
    private BackendService service;

    private ConfigProperties config;

    @Override
    public Authentication attemptAuthentication(HttpServletRequest req, HttpServletResponse res) {

        try {
        
            TMSUser user = new ObjectMapper().readValue(req.getInputStream(), TMSUser.class);
            Authentication auth = new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword());
            System.out.println("Username: " + user.getUsername());
            System.out.println("Password: " + user.getPassword());
            return authManager.authenticate(auth);
        }
        catch (IOException e) {

            System.out.println("Error occurred: \n\t" + e.getMessage());
            throw new RuntimeException();
        }
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest req, HttpServletResponse res, AuthenticationException auth_exception) {

        System.out.println("failed");
        try {
            
            res.setContentType("application/json");
            res.setCharacterEncoding("UTF-8");
            res.getWriter().write("{\n" 
                                    + "\"error\":\"Invalid Username/Password\""
                                    + "\n}");
            res.getWriter().flush();
        }
        catch (Exception e) {

            System.out.println(e.getMessage());
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest req, HttpServletResponse res, FilterChain filter, Authentication auth_result) throws IOException, ServletException {

        System.out.println("complete");
        try {

            String token = JWT.create()
                                .withSubject(auth_result.getName())
                                .withClaim("username", auth_result.getName())
                                .withClaim("ipaddress", req.getRemoteAddr())
                                .withClaim("browser", req.getHeader("User-Agent"))
                                .withExpiresAt(new Date(System.currentTimeMillis() + 72000000))
                                .sign(Algorithm.HMAC512(config.getJwtsecret()));
                                
            System.out.println("ipaddress:" + req.getRemoteAddr());
            System.out.println("browser type:" + req.getHeader("User-Agent"));

            res.setContentType("application/json");
            res.setCharacterEncoding("UTF-8");
            res.getWriter().write("{\n" 
                                    + "\"error\":null,\n"
                                    + "\"tmptoken\":\"" + token 
                                    + "\"\n}");
            res.getWriter().flush();

            service.UpdatingUserTokenService(auth_result.getName(), token);
        }
        catch (Exception e) {

            System.out.println(e.getMessage());
        }
    }
}
