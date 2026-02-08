package com.zilla.eproc.exception;

import com.zilla.eproc.dto.DuplicateWarningDTO;
import lombok.Getter;

import java.util.List;

/**
 * Exception thrown when duplicate requests are detected.
 */
@Getter
public class DuplicateRequestException extends RuntimeException {
    private final List<DuplicateWarningDTO> duplicates;

    public DuplicateRequestException(String message, List<DuplicateWarningDTO> duplicates) {
        super(message);
        this.duplicates = duplicates;
    }
}
