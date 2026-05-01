package com.datn.dms.configuations;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import com.convertapi.client.Config;

@Configuration
public class ConvertApiConfig {

    @Value("${app.convertapi.secret}")
    String secret;

    @PostConstruct
    public void initConvertApi() {
        Config.setDefaultApiCredentials(secret);
    }
}
