package com.zilla.eproc.repository;

import com.zilla.eproc.model.Request;
import com.zilla.eproc.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {

    /**
     * Find all requests created by a specific user, ordered by creation date
     * descending.
     */
    List<Request> findByCreatedByIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find all requests created by a specific user (not ordered).
     */
    List<Request> findByCreatedById(Long userId);

    /**
     * Find all requests for a specific project, ordered by creation date
     * descending.
     */
    List<Request> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    /**
     * Find all requests for multiple projects.
     */
    List<Request> findByProjectIdIn(List<Long> projectIds);

    /**
     * Find all requests for a specific site.
     */
    List<Request> findBySiteId(Long siteId);

    /**
     * Check if a BOQ reference code already exists.
     */
    boolean existsByBoqReferenceCode(String boqReferenceCode);

    /**
     * Find all requests by status, ordered by creation date descending.
     */
    List<Request> findByStatusOrderByCreatedAtDesc(RequestStatus status);

    /**
     * Find all pending (SUBMITTED) requests for projects owned by a specific user.
     */
    List<Request> findByStatusAndProjectOwnerIdOrderByCreatedAtDesc(RequestStatus status, Long ownerId);

    /**
     * Find all requests for projects owned by a specific user.
     */
    List<Request> findByProjectOwnerIdOrderByCreatedAtDesc(Long ownerId);

    /**
     * Find overlapping requests for duplicate detection.
     * Checks for requests with:
     * - Same site
     * - Overlapping timeline
     * - Matching material names (case-insensitive)
     * - Active statuses (not rejected or cancelled)
     */
    @Query("SELECT DISTINCT r FROM Request r " +
            "JOIN r.materials m " +
            "WHERE r.site.id = :siteId " +
            "AND LOWER(m.name) IN :materialNames " +
            "AND r.status IN ('PENDING', 'SUBMITTED', 'APPROVED', 'PARTIALLY_APPROVED') " +
            "AND ((r.plannedStartDate <= :plannedEnd AND r.plannedEndDate >= :plannedStart) " +
            "OR (r.plannedStartDate IS NULL OR r.plannedEndDate IS NULL))")
    List<Request> findOverlappingRequests(
            @Param("siteId") Long siteId,
            @Param("materialNames") List<String> materialNames,
            @Param("plannedStart") LocalDateTime plannedStart,
            @Param("plannedEnd") LocalDateTime plannedEnd);
}
