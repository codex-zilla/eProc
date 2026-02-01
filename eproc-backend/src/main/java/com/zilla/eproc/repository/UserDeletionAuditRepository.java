package com.zilla.eproc.repository;

import com.zilla.eproc.model.UserDeletionAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for UserDeletionAudit entity.
 * Provides access to user deletion audit trail.
 */
@Repository
public interface UserDeletionAuditRepository extends JpaRepository<UserDeletionAudit, Long> {

    /**
     * Find audit record by the original deleted user ID.
     * Useful for looking up historical user information.
     */
    Optional<UserDeletionAudit> findByDeletedUserId(Long deletedUserId);

    /**
     * Find all deletions performed by a specific user (typically PROJECT_OWNER).
     */
    List<UserDeletionAudit> findByDeletedBy(Long deletedBy);

    /**
     * Find audit records by deleted user email.
     * Useful for tracking if an email was previously used.
     */
    List<UserDeletionAudit> findByDeletedUserEmail(String email);
}
