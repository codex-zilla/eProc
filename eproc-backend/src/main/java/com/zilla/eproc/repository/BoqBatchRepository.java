package com.zilla.eproc.repository;

import com.zilla.eproc.model.BoqBatch;
import com.zilla.eproc.model.BatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoqBatchRepository extends JpaRepository<BoqBatch, Long> {

    /**
     * Find all batches for a specific project.
     */
    List<BoqBatch> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    /**
     * Find all batches created by a specific user.
     */
    List<BoqBatch> findByCreatedByIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find batches by status.
     */
    List<BoqBatch> findByStatusOrderByCreatedAtDesc(BatchStatus status);

    /**
     * Find batches for a project with a specific status.
     */
    List<BoqBatch> findByProjectIdAndStatusOrderByCreatedAtDesc(Long projectId, BatchStatus status);

    /**
     * Count batches by status for a project.
     */
    @Query("SELECT COUNT(b) FROM BoqBatch b WHERE b.project.id = :projectId AND b.status = :status")
    long countByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") BatchStatus status);
}
