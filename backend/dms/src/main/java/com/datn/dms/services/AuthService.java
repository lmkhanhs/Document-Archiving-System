package com.datn.dms.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.datn.dms.dtos.auth.request.LoginRequest;
import com.datn.dms.dtos.auth.request.LogoutRequest;
import com.datn.dms.dtos.auth.request.RegisterRequest;
import com.datn.dms.dtos.auth.response.LoginResponse;
import com.datn.dms.dtos.auth.response.LogoutResponse;
import com.datn.dms.dtos.auth.response.RegisterResponse;
import com.datn.dms.entities.RoleEntity;
import com.datn.dms.entities.UserEntity;
import com.datn.dms.emuns.RoleEnums;
import com.datn.dms.exception.AppException;
import com.datn.dms.exception.ErrorCode;
import com.datn.dms.repositories.RoleRepository;
import com.datn.dms.repositories.UserRepository;
import com.datn.dms.utils.BaseRedisUtils;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import java.text.ParseException;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthService {
    final BaseRedisUtils baseRedisUtils;
    final UserRepository userRepository;
    final RoleRepository roleRepository;
    final PasswordEncoder passwordEncoder;

    @Value("${app.security.expiresIn}")
    Integer expiresIn;

    @Value("${app.security.expiresRefresh}")
    Integer expiresRefresh;

    @Value("${app.security.secret}")
    String SECRET;

    private static final String TOKEN_PREFIX = "BLACKLIST:TOKEN:";

    public LoginResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated) {
            throw new AppException(ErrorCode.AUTHENTICATION_EXCEPTION);
        }

        String accessToken = generateToken(user, false);
        String refreshToken = generateToken(user, true);

        return LoginResponse.builder()
                .tokenType("Bearer")
                .accessToken(accessToken)
                .expiresIn(expiresIn)
                .refreshToken(refreshToken)
                .build();
    }

    private String jwtID (String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWTClaimsSet jwtClaimsSet = signedJWT.getJWTClaimsSet();
            return  jwtClaimsSet.getJWTID();
        }
        catch (ParseException e) {
            throw new RuntimeException(e);
        }
    }
    private long timeToLongToken(String token) {
        SignedJWT signedJWT = null;
        try {
            signedJWT = SignedJWT.parse(token);
            JWTClaimsSet jwtClaimsSet = signedJWT.getJWTClaimsSet();
            Date expirationTime = jwtClaimsSet.getExpirationTime();
            Date now = new Date();
            long durationInMillis = expirationTime.getTime() - now.getTime();
            return durationInMillis / 1000;
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
    }
    
    public LogoutResponse handleLogout(LogoutRequest logoutRequest) {
        String accessToken = logoutRequest.getAccessToken();
        String refreshToken = logoutRequest.getRefreshToken();
        
        if (accessToken != null && !accessToken.isBlank()) {
            this.baseRedisUtils.set(this.TOKEN_PREFIX + this.jwtID(accessToken), true, this.timeToLongToken(accessToken), TimeUnit.SECONDS);
        }
        if (refreshToken != null && !refreshToken.isBlank()) {
            this.baseRedisUtils.set(this.TOKEN_PREFIX + this.jwtID(refreshToken), true, this.timeToLongToken(refreshToken), TimeUnit.SECONDS);
        }

        return LogoutResponse.builder()
                .success(true)
                .build();
    }

    public String generateToken(UserEntity user, boolean isRefreshToken) {
        try {
            JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

            Date expirationTime;
            if (isRefreshToken) {
                expirationTime = new Date(System.currentTimeMillis() + (expiresRefresh * 1000L));
            } else {
                expirationTime = new Date(System.currentTimeMillis() + (expiresIn * 1000L));
            }
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(user.getUsername())
                    .issuer("datn.dms")
                    .issueTime(new Date())
                    .expirationTime(expirationTime)
                    .claim("scope", buildScope(user))
                    .claim("jti", UUID.randomUUID().toString())
                    .claim("user_id", user.getId())
                    .build();

            Payload payload = new Payload(claimsSet.toJSONObject());
            JWSObject jwsObject = new JWSObject(header, payload);

            JWSSigner signer = new MACSigner(SECRET.getBytes());
            jwsObject.sign(signer);

            return jwsObject.serialize();
        } catch (JOSEException e) {
            throw new RuntimeException("Cannot create token", e);
        }
    }

    private String buildScope(UserEntity user) {
        StringBuilder scopeBuilder = new StringBuilder();
        if (user.getRoles() != null) {
            user.getRoles().forEach(role -> {
                scopeBuilder.append(role.getName()).append(" ");
            });
        }
        return scopeBuilder.toString().trim();
    }

    private boolean checkTokenInBlackList(String jwtID) {
        Object result = this.baseRedisUtils.getForString(this.TOKEN_PREFIX + jwtID);
        return result != null; // Safer, because any existence in the blacklist means it's revoked
    }

    public boolean introspectToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);

            boolean verified = signedJWT.verify(new MACVerifier(SECRET.getBytes()));

            JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();
            String jwtID = claimsSet.getJWTID();
            Date expires = claimsSet.getExpirationTime();
            Date now = new Date();
            
            if (expires == null || !verified || now.after(expires) || checkTokenInBlackList(jwtID)) {
                return false;
            }
            return true;
        } catch (ParseException | JOSEException e) {
            // If the token is malformed or verification throws an error, it is invalid.
            return false;
        }
    }

    public RegisterResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Set<RoleEntity> roles = new HashSet<>();
        roleRepository.findByName(RoleEnums.USER.name()).ifPresent(roles::add);

        UserEntity user = UserEntity.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .isActive(true) // Tài khoản kích hoạt mặc định
                .roles(roles)
                .thumbnailUrl("/uploads/thumbnail/default.png")
                .build();

        userRepository.save(user);

        return RegisterResponse.builder()
                .success(true)
                .build();
    }
}
