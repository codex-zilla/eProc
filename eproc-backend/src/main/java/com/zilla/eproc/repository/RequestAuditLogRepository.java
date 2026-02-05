package com.zilla.eproc.repository;

import com.zilla.eproc.model.RequestAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestAuditLogRepository extends JpaRepository<RequestAuditLog, Long> {

    /**
     * Find all audit logs for a specific request.
     */
    List<RequestAuditLog> findByRequestIdOrderByTimestampDesc(Long requestId);
}
