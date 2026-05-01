package com.datn.dms.configuations;

import java.util.Objects;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import com.datn.dms.services.AuthService;
import org.springframework.stereotype.Component;

@Component
public class JwtDecodeCustomize implements JwtDecoder {

    @Value("${app.security.secret}")
    private String SECRET;
    @Autowired
    @Lazy
    private AuthService authService;    

    private NimbusJwtDecoder nimbusJwtDecoder = null;
    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            boolean introspectToken = this.authService.introspectToken(token);
            if ( !introspectToken) {
                throw new JwtException("Invalid token");
            }
        }
        catch (JwtException e) {
            throw new JwtException(e.getMessage());
        }
        if( Objects.isNull(nimbusJwtDecoder)) {
            SecretKeySpec secretKeySpec = new  SecretKeySpec(SECRET.getBytes(), "HmacSHA512");
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS512)
                    .build();
        }
        return nimbusJwtDecoder.decode(token);
    }
}