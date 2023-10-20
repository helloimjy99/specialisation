package com.tmsgrp3.backend.exceptions;

public class EntityNotFoundException extends RuntimeException{
    
    public EntityNotFoundException(String msg) {

        super(msg);
    }
}
