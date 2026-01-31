package com.zilla.eproc.service;

import com.zilla.eproc.dto.AuthResponse;
import com.zilla.eproc.dto.LoginRequest;
import com.zilla.eproc.dto.RegisterRequest;
import com.zilla.eproc.model.User;
import com.zilla.eproc.repository.UserRepository;
import com.zilla.eproc.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service handling user authentication operations.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Register a new user.
     * 
     * @param request the registration request
     * @return AuthResponse with JWT token
     * @throws IllegalArgumentException if email already exists
     */
    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Create new user
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .name(request.getName())
                .erbNumber(request.getErbNumber())
                .phoneNumber(request.getPhoneNumber())
                .build();

        userRepository.save(user);

        // Generate token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole())
                .name(user.getName())
                .id(user.getId())
                .build();
    }

    /**
     * Authenticate a user.
     * 
     * @param request the login request
     * @return AuthResponse with JWT token
     * @throws IllegalArgumentException if credentials are invalid
     */
    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Generate token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole())
                .name(user.getName())
                .id(user.getId())
                .build();
    }
}
