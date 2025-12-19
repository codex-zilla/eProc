package com.zilla.eproc.repository;

import com.zilla.eproc.model.RequestAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for request audit log entries.
 */
@Repository
public interface RequestAuditLogRepository extends JpaRepository<RequestAuditLog, Long> {

    /**
     * Find all audit entries for a request, ordered by creation time descending.
     */
    List<RequestAuditLog> findByRequestIdOrderByCreatedAtDesc(Long requestId);

    /**
     * Find all audit entries for a request, ordered by creation time ascending
     * (timeline order).
     */
    List<RequestAuditLog> findByRequestIdOrderByCreatedAtAsc(Long requestId);
}
