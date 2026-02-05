package com.zilla.eproc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * RequestAttachment entity - Stores metadata for files attached to batches or
 * individual requests.
 */
@Entity
@Table(name = "request_attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Column(nullable = false, length = 100)
    private String fileType; // e.g., "application/pdf", "image/jpeg"

    @Column(nullable = false)
    private Long fileSize; // in bytes

    @Column(nullable = false, length = 500)
    private String storagePath; // Path or URL to the file in storage

    /**
     * Optional: Link to a batch (if this is a batch-level attachment).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private BoqBatch batch;

    /**
     * Optional: Link to an individual request (if this is a request-level
     * attachment).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private MaterialRequest request;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private User uploadedBy;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;
}
