package com.zilla.eproc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for changing user password.
 */
@Data
public class ChangePasswordRequest {

    @NotBlank(message = "Old password is required")
    private String oldPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String newPassword;
}
