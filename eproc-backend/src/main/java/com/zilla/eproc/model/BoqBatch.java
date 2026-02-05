package com.zilla.eproc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * BoqBatch entity - Groups multiple MaterialRequest items together.
 * Represents a batch submission of BOQ items (e.g., "Foundation Works - Zone
 * A").
 */
@Entity
@Table(name = "boq_batches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoqBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private BatchStatus status = BatchStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    /**
     * Material requests (items) that belong to this batch.
     */
    @Builder.Default
    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MaterialRequest> items = new ArrayList<>();

    /**
     * Attachments (photos, PDFs, Excel) for this batch.
     */
    @Builder.Default
    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RequestAttachment> attachments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Compute total value of all items in the batch.
     */
    @Transient
    public Double getTotalValue() {
        return items.stream()
                .mapToDouble(item -> {
                    if (item.getQuantity() != null && item.getRateEstimate() != null) {
                        return item.getQuantity().doubleValue() * item.getRateEstimate().doubleValue();
                    }
                    return 0.0;
                })
                .sum();
    }

    /**
     * Get count of items in this batch.
     */
    @Transient
    public int getItemCount() {
        return items.size();
    }
}
