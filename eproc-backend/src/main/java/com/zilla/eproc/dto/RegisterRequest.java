package com.zilla.eproc.dto;

import com.zilla.eproc.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for user registration.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Role is required")
    private Role role;

    /**
     * ERB (Engineers Registration Board) number for engineers.
     * Optional field, primarily for ENGINEER role.
     */
    private String erbNumber;

    /**
     * Phone number for site-level coordination.
     * Optional but recommended for all users.
     */
    private String phoneNumber;
}
