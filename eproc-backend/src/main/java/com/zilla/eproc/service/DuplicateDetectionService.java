package com.zilla.eproc.service;

import com.zilla.eproc.dto.DuplicateWarningDTO;
import com.zilla.eproc.model.Material;
import com.zilla.eproc.model.Request;
import com.zilla.eproc.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for detecting duplicate material requests based on timeline overlap.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DuplicateDetectionService {

    private final RequestRepository requestRepository;

    /**
     * Check for duplicate requests based on:
     * - Same site
     * - Same material names (case-insensitive match)
     * - Overlapping timeline (plannedStartDate/plannedEndDate)
     *
     * @param siteId        Site ID
     * @param materialNames List of material names to check
     * @param plannedStart  Planned start date
     * @param plannedEnd    Planned end date
     * @return List of potential duplicate warnings
     */
    public List<DuplicateWarningDTO> findPotentialDuplicates(
            Long siteId,
            List<String> materialNames,
            LocalDateTime plannedStart,
            LocalDateTime plannedEnd) {

        log.info("Checking for duplicates: siteId={}, materials={}, timeline={} to {}",
                siteId, materialNames, plannedStart, plannedEnd);

        if (materialNames == null || materialNames.isEmpty()) {
            return new ArrayList<>();
        }

        // Normalize material names to lowercase for case-insensitive comparison
        List<String> normalizedNames = materialNames.stream()
                .map(String::toLowerCase)
                .distinct()
                .collect(Collectors.toList());

        // Find overlapping requests
        List<Request> overlappingRequests = requestRepository.findOverlappingRequests(
                siteId,
                normalizedNames,
                plannedStart,
                plannedEnd);

        log.info("Found {} potentially overlapping requests", overlappingRequests.size());

        // Convert to DTOs with overlap information
        return overlappingRequests.stream()
                .map(request -> mapToDuplicateWarning(request, normalizedNames, plannedStart, plannedEnd))
                .collect(Collectors.toList());
    }

    /**
     * Map Request to DuplicateWarningDTO with overlap information.
     */
    private DuplicateWarningDTO mapToDuplicateWarning(
            Request request,
            List<String> requestedMaterials,
            LocalDateTime newStart,
            LocalDateTime newEnd) {

        // Find overlapping materials
        List<String> overlappingMaterials = request.getMaterials().stream()
                .map(Material::getName)
                .filter(name -> requestedMaterials.contains(name.toLowerCase()))
                .collect(Collectors.toList());

        // Calculate timeline overlap percentage
        Double overlapPercentage = calculateTimelineOverlap(
                request.getPlannedStartDate(),
                request.getPlannedEndDate(),
                newStart,
                newEnd);

        return DuplicateWarningDTO.builder()
                .requestId(request.getId())
                .requestTitle(request.getTitle())
                .boqReferenceCode(request.getBoqReferenceCode())
                .plannedStartDate(request.getPlannedStartDate())
                .plannedEndDate(request.getPlannedEndDate())
                .overlappingMaterials(overlappingMaterials)
                .timelineOverlapPercentage(overlapPercentage)
                .status(request.getStatus().name())
                .siteName(request.getSite().getName())
                .build();
    }

    /**
     * Calculate the percentage of timeline overlap between two periods.
     *
     * @return Percentage of overlap (0-100)
     */
    private Double calculateTimelineOverlap(
            LocalDateTime start1, LocalDateTime end1,
            LocalDateTime start2, LocalDateTime end2) {

        // Handle null dates - assume 100% overlap if dates are missing
        if (start1 == null || end1 == null || start2 == null || end2 == null) {
            return 100.0;
        }

        // Find overlap period
        LocalDateTime overlapStart = start1.isAfter(start2) ? start1 : start2;
        LocalDateTime overlapEnd = end1.isBefore(end2) ? end1 : end2;

        // No overlap
        if (overlapStart.isAfter(overlapEnd)) {
            return 0.0;
        }

        // Calculate overlap duration in days
        long overlapDays = ChronoUnit.DAYS.between(overlapStart, overlapEnd);

        // Calculate total duration of the new request
        long totalDays = ChronoUnit.DAYS.between(start2, end2);

        if (totalDays == 0) {
            return 100.0; // Same day request
        }

        // Return percentage
        return (double) overlapDays / totalDays * 100.0;
    }
}
