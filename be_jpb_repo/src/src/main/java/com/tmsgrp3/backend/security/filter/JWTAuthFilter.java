package com.tmsgrp3.backend.security.filter;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.filter.OncePerRequestFilter;

import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.JWT;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.MapType;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.tmsgrp3.backend.entities.TMSUser;
import com.tmsgrp3.backend.exceptions.BadCredentialsException;
import com.tmsgrp3.backend.service.BackendService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JWTAuthFilter extends OncePerRequestFilter {

    @Autowired
    BackendService service;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain filter_chain) throws ServletException, IOException {

        /*ObjectMapper mapper = new ObjectMapper();

        TypeFactory type_factory = mapper.getTypeFactory();

        MapType map_type = type_factory.constructMapType(HashMap.class, String.class, String.class); 

        HashMap<String, String> body = mapper.readValue(req.getInputStream(), map_type);

        String token = (body.get("token"));

        if (token == null) {

            filter_chain.doFilter(req, res);
            return;
        }*/

        /*String headers = req.getHeader("Authorization");
        String token = headers.replace("Bearer ", "");

        System.out.println(token);

        if (token == null) {

            filter_chain.doFilter(req, res);
            return;
        }

        DecodedJWT decoded_jwt = JWT.require(Algorithm.HMAC512("9CXbcgP+4C2Bbvgnx9K3mPXeeOV1gHmsJyQ0/JzfAEnMoPb0dk2PLvup7lzINkKy3qABG19jdgFdYAOHLWGMWbWbgPYx5QJMjLOng3OUt4A="))
            .build()
            .verify(token);

        String user = decoded_jwt.getClaim("username").asString();
        String ipaddress = decoded_jwt.getClaim("ipaddress").asString();
        String browser_type = decoded_jwt.getClaim("browser").asString();

        System.out.println("username readback: " + user);
        System.out.println("browser readback: " + browser_type);
        System.out.println("ipaddress readback: " + ipaddress);
        
        Authentication auth = new UsernamePasswordAuthenticationToken(user, null, Arrays.asList());

        //verify that username exists
        TMSUser verify_username = service.GetUserCredentials(user);

        if (verify_username == null) {

            throw new JWTVerificationException("Invalid token");
        }*/
        System.out.println("JWTfilterrunning");
        filter_chain.doFilter(req, res);
    }
    
}
