package com.tmsgrp3.backend;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Component
@ConfigurationProperties(prefix = "tmsgrp3")
@Getter
@Setter
public class ConfigProperties {
    
    private String jwtsecret;
    private String url;
    private String username;
    private String password;
    private String emailsender;
}
