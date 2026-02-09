package com.zilla.eproc.controller;

import com.zilla.eproc.dto.AuthResponse;
import com.zilla.eproc.dto.ChangePasswordRequest;
import com.zilla.eproc.dto.LoginRequest;
import com.zilla.eproc.dto.RegisterRequest;
import com.zilla.eproc.model.RefreshToken;
import com.zilla.eproc.model.User;
import com.zilla.eproc.security.JwtUtil;
import com.zilla.eproc.service.AuthService;
import com.zilla.eproc.service.RefreshTokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);

        ResponseCookie jwtCookie = jwtUtil.generateJwtCookie(user.getEmail(), user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        ResponseCookie jwtRefreshCookie = jwtUtil.generateRefreshJwtCookie(refreshToken.getToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString())
                .body(AuthResponse.builder()
                        .email(user.getEmail())
                        .role(user.getRole())
                        .name(user.getName())
                        .id(user.getId())
                        .build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = authService.login(request);

        ResponseCookie jwtCookie = jwtUtil.generateJwtCookie(user.getEmail(), user.getRole().name());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        ResponseCookie jwtRefreshCookie = jwtUtil.generateRefreshJwtCookie(refreshToken.getToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString())
                .body(AuthResponse.builder()
                        .email(user.getEmail())
                        .role(user.getRole())
                        .name(user.getName())
                        .id(user.getId())
                        .requirePasswordChange(user.getRequirePasswordChange())
                        .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshMyToken(HttpServletRequest request) {
        String refreshToken = jwtUtil.getJwtRefreshFromCookies(request);

        if ((refreshToken != null) && (refreshToken.length() > 0)) {
            return refreshTokenService.findByToken(refreshToken)
                    .map(refreshTokenService::verifyExpiration)
                    .map(RefreshToken::getUser)
                    .map(user -> {
                        // Rotation: create new refresh token
                        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user.getId());
                        ResponseCookie jwtCookie = jwtUtil.generateJwtCookie(user.getEmail(), user.getRole().name());
                        ResponseCookie jwtRefreshCookie = jwtUtil.generateRefreshJwtCookie(newRefreshToken.getToken());

                        return ResponseEntity.ok()
                                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                                .header(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString())
                                .body("Token Refreshed Successfully!");
                    })
                    .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
        }
        return ResponseEntity.badRequest().body("Refresh Token is empty!");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        ResponseCookie jwtCookie = jwtUtil.getCleanJwtCookie();
        ResponseCookie jwtRefreshCookie = jwtUtil.getCleanJwtRefreshCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, jwtRefreshCookie.toString())
                .body("You've been signed out!");
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        authService.changePassword(email, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
