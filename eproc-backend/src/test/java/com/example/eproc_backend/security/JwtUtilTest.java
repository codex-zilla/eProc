package com.example.eproc_backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for JwtUtil.
 */
class JwtUtilTest {

    private JwtUtil jwtUtil;
    private static final String TEST_SECRET = "test-secret-key-for-unit-testing-only";
    private static final long EXPIRATION = 86400000; // 24 hours

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(TEST_SECRET, EXPIRATION);
    }

    @Test
    void generateToken_createsValidToken() {
        String token = jwtUtil.generateToken("test@example.com", "ENGINEER");

        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts separated by dots
    }

    @Test
    void validateToken_returnsTrue_forValidToken() {
        String token = jwtUtil.generateToken("test@example.com", "ENGINEER");

        assertTrue(jwtUtil.validateToken(token));
    }

    @Test
    void validateToken_returnsFalse_forInvalidToken() {
        assertFalse(jwtUtil.validateToken("invalid.token.here"));
    }

    @Test
    void validateToken_returnsFalse_forNullToken() {
        assertFalse(jwtUtil.validateToken(null));
    }

    @Test
    void validateToken_returnsFalse_forEmptyToken() {
        assertFalse(jwtUtil.validateToken(""));
    }

    @Test
    void validateToken_returnsFalse_forExpiredToken() {
        // Create a JwtUtil with 0ms expiration (token expires immediately)
        JwtUtil shortLivedJwtUtil = new JwtUtil(TEST_SECRET, 0);
        String token = shortLivedJwtUtil.generateToken("test@example.com", "ENGINEER");

        // Wait a bit to ensure token is expired
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        assertFalse(shortLivedJwtUtil.validateToken(token));
    }

    @Test
    void validateToken_returnsFalse_forWrongSignature() {
        String token = jwtUtil.generateToken("test@example.com", "ENGINEER");

        // Create another JwtUtil with different secret
        JwtUtil differentJwtUtil = new JwtUtil("different-secret-key-completely", EXPIRATION);

        assertFalse(differentJwtUtil.validateToken(token));
    }

    @Test
    void getEmailFromToken_extractsEmail() {
        String email = "engineer@test.com";
        String token = jwtUtil.generateToken(email, "ENGINEER");

        assertEquals(email, jwtUtil.getEmailFromToken(token));
    }

    @Test
    void getRoleFromToken_extractsRole() {
        String role = "PROJECT_MANAGER";
        String token = jwtUtil.generateToken("manager@test.com", role);

        assertEquals(role, jwtUtil.getRoleFromToken(token));
    }

    @Test
    void tokenContainsAllClaims() {
        String email = "accountant@test.com";
        String role = "ACCOUNTANT";
        String token = jwtUtil.generateToken(email, role);

        assertEquals(email, jwtUtil.getEmailFromToken(token));
        assertEquals(role, jwtUtil.getRoleFromToken(token));
        assertTrue(jwtUtil.validateToken(token));
    }
}
