package com.zilla.eproc.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.util.WebUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utility class for JWT token generation and validation.
 */
@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final long jwtExpiration;
    private final long refreshExpiration;
    private final String jwtCookie;
    private final String jwtRefreshCookie;

    @org.springframework.beans.factory.annotation.Autowired
    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long jwtExpiration,
            @Value("${jwt.refresh-expiration}") long refreshExpiration,
            @Value("${jwt.cookie-name}") String jwtCookie,
            @Value("${jwt.refresh-cookie-name}") String jwtRefreshCookie) {
        // Ensure the secret is at least 256 bits (32 bytes) for HS256
        String paddedSecret = secret;
        while (paddedSecret.length() < 32) {
            paddedSecret += secret;
        }
        this.secretKey = Keys.hmacShaKeyFor(paddedSecret.substring(0, 32).getBytes(StandardCharsets.UTF_8));
        this.jwtExpiration = jwtExpiration;
        this.refreshExpiration = refreshExpiration;
        this.jwtCookie = jwtCookie;
        this.jwtRefreshCookie = jwtRefreshCookie;
    }

    /**
     * Legacy constructor for tests.
     */
    public JwtUtil(String secret, long jwtExpiration) {
        this(secret, jwtExpiration, 86400000L, "eproc-jwt", "eproc-refresh-jwt");
    }

    /**
     * Legacy method for generating token string directly (used in tests).
     */
    public String generateToken(String email, String role) {
        return generateTokenFromEmail(email, role);
    }

    public ResponseCookie generateJwtCookie(String email, String role) {
        String jwt = generateTokenFromEmail(email, role);
        return generateCookie(jwtCookie, jwt, "/api", jwtExpiration / 1000);
    }

    public ResponseCookie generateRefreshJwtCookie(String refreshToken) {
        return generateCookie(jwtRefreshCookie, refreshToken, "/api/auth/refresh", refreshExpiration / 1000);
    }

    public ResponseCookie getCleanJwtCookie() {
        return ResponseCookie.from(jwtCookie, null).path("/api").build();
    }

    public ResponseCookie getCleanJwtRefreshCookie() {
        return ResponseCookie.from(jwtRefreshCookie, null).path("/api/auth/refresh").build();
    }

    public String getJwtFromCookies(HttpServletRequest request) {
        return getCookieValueByName(request, jwtCookie);
    }

    public String getJwtRefreshFromCookies(HttpServletRequest request) {
        return getCookieValueByName(request, jwtRefreshCookie);
    }

    private ResponseCookie generateCookie(String name, String value, String path, long maxAgeSeconds) {
        return ResponseCookie.from(name, value)
                .path(path)
                .maxAge(maxAgeSeconds)
                .httpOnly(true)
                .secure(false) // Set to true in production with HTTPS
                .sameSite("Strict")
                .build();
    }

    private String getCookieValueByName(HttpServletRequest request, String name) {
        Cookie cookie = WebUtils.getCookie(request, name);
        if (cookie != null) {
            return cookie.getValue();
        }
        return null;
    }

    /**
     * Generate a JWT token for a user.
     */
    public String generateTokenFromEmail(String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    /**
     * Validate a JWT token.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extract email from token.
     */
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    /**
     * Extract role from token.
     */
    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.get("role", String.class);
    }
}
