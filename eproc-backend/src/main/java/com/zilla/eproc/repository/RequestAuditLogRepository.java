package com.zilla.eproc.repository;

import com.zilla.eproc.model.RequestAuditLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestAuditLogRepository extends JpaRepository<RequestAuditLog, Long> {

    /**
     * Find all audit logs for a specific request (for request history view).
     */
    List<RequestAuditLog> findByRequestIdOrderByTimestampDesc(Long requestId);

    /**
     * Find the most recent audit log entries for requests created by a given user.
     * Used to populate the Engineer activity feed on the dashboard.
     */
    @Query("SELECT a FROM RequestAuditLog a " +
            "JOIN FETCH a.request r " +
            "JOIN FETCH a.performedBy " +
            "WHERE r.createdBy.id = :userId " +
            "ORDER BY a.timestamp DESC")
    List<RequestAuditLog> findRecentByRequestCreatorId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Find audit logs for requests owned by a given manager, filtered by action.
     * Used to compute average approval time on the Manager dashboard.
     */
    @Query("SELECT a FROM RequestAuditLog a " +
            "JOIN FETCH a.request r " +
            "WHERE r.project.owner.id = :ownerId " +
            "AND a.action IN :actions " +
            "ORDER BY a.timestamp DESC")
    List<RequestAuditLog> findByRequestOwnerAndActions(
            @Param("ownerId") Long ownerId,
            @Param("actions") List<String> actions);
}
