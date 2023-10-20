package com.tmsgrp3.backend.exceptions;

import org.springframework.security.core.AuthenticationException;


public class BadCredentialsException extends AuthenticationException {
    
    public BadCredentialsException(String msg) {
        super(msg);
    }
}
