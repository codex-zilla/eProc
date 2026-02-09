package com.zilla.eproc.service;

import com.zilla.eproc.dto.LoginRequest;
import com.zilla.eproc.dto.RegisterRequest;
import com.zilla.eproc.model.User;
import com.zilla.eproc.repository.UserRepository;
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

    /**
     * Register a new user.
     */
    public User register(RegisterRequest request) {
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

        return userRepository.save(user);
    }

    /**
     * Authenticate a user.
     */
    public User login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Verify active status
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new IllegalArgumentException("User account is inactive");
        }

        return user;
    }

    /**
     * Change user password.
     */
    public void changePassword(String userEmail, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Update password and clear requirePasswordChange flag
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setRequirePasswordChange(false);
        userRepository.save(user);
    }
}
