package com.tmsgrp3.backend.security.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.tmsgrp3.backend.entities.TMSUser;
import com.tmsgrp3.backend.exceptions.BadCredentialsException;
import com.tmsgrp3.backend.service.BackendService;

import lombok.AllArgsConstructor;

@Component
@AllArgsConstructor
public class CustomAuthManager implements AuthenticationManager {

    @Autowired
    BackendService service;

    @Autowired
    BCryptPasswordEncoder bCryptPasswordEncoder;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {

        TMSUser user = service.GetUserCredentials(authentication.getName());

        if (user == null || !bCryptPasswordEncoder.matches(authentication.getCredentials().toString(), user.getPassword())) {

            throw new BadCredentialsException("Invalid Username/Password");
        }

        return new UsernamePasswordAuthenticationToken(authentication.getName(), user.getPassword());
    }
}
