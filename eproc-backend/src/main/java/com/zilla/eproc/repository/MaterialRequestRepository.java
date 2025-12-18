package com.zilla.eproc.repository;

import com.zilla.eproc.model.MaterialRequest;
import com.zilla.eproc.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for MaterialRequest entity with custom queries for duplicate
 * detection.
 */
@Repository
public interface MaterialRequestRepository extends JpaRepository<MaterialRequest, Long> {

    /**
     * Find requests by site and status.
     */
    List<MaterialRequest> findBySiteIdAndStatus(Long siteId, RequestStatus status);

    /**
     * Find requests by status (for approval queue).
     */
    List<MaterialRequest> findByStatus(RequestStatus status);

    /**
     * Find requests by requester (for "My Requests" view).
     */
    List<MaterialRequest> findByRequestedById(Long requestedById);

    /**
     * Find requests by requester and status.
     */
    List<MaterialRequest> findByRequestedByIdAndStatus(Long requestedById, RequestStatus status);

    /**
     * Find requests by site.
     */
    List<MaterialRequest> findBySiteId(Long siteId);

    /**
     * Find potential duplicates with overlapping usage windows for catalog
     * material.
     * Overlap logic: new.start < existing.end AND new.end > existing.start
     */
    @Query("SELECT mr FROM MaterialRequest mr WHERE " +
            "mr.site.id = :siteId " +
            "AND mr.material.id = :materialId " +
            "AND mr.status IN (com.zilla.eproc.model.RequestStatus.PENDING, com.zilla.eproc.model.RequestStatus.APPROVED) "
            +
            "AND mr.plannedUsageStart < :newEnd " +
            "AND mr.plannedUsageEnd > :newStart " +
            "AND (:excludeId IS NULL OR mr.id != :excludeId)")
    List<MaterialRequest> findCatalogDuplicatesWithOverlappingWindow(
            @Param("siteId") Long siteId,
            @Param("materialId") Long materialId,
            @Param("newStart") LocalDateTime newStart,
            @Param("newEnd") LocalDateTime newEnd,
            @Param("excludeId") Long excludeId);

    /**
     * Find potential duplicates with overlapping usage windows for manual material.
     * Uses case-insensitive name matching.
     */
    @Query("SELECT mr FROM MaterialRequest mr WHERE " +
            "mr.site.id = :siteId " +
            "AND LOWER(mr.manualMaterialName) = LOWER(:manualName) " +
            "AND mr.status IN (com.zilla.eproc.model.RequestStatus.PENDING, com.zilla.eproc.model.RequestStatus.APPROVED) "
            +
            "AND mr.plannedUsageStart < :newEnd " +
            "AND mr.plannedUsageEnd > :newStart " +
            "AND (:excludeId IS NULL OR mr.id != :excludeId)")
    List<MaterialRequest> findManualDuplicatesWithOverlappingWindow(
            @Param("siteId") Long siteId,
            @Param("manualName") String manualName,
            @Param("newStart") LocalDateTime newStart,
            @Param("newEnd") LocalDateTime newEnd,
            @Param("excludeId") Long excludeId);

    /**
     * Count pending requests for dashboard stats.
     */
    long countByStatus(RequestStatus status);

    /**
     * Count requests by status and site.
     */
    long countBySiteIdAndStatus(Long siteId, RequestStatus status);
}
