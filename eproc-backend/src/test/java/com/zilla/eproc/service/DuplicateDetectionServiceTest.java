package com.zilla.eproc.service;

import com.zilla.eproc.dto.DuplicateWarningDTO;
import com.zilla.eproc.model.Material;
import com.zilla.eproc.model.Request;
import com.zilla.eproc.model.RequestStatus;
import com.zilla.eproc.model.Site;
import com.zilla.eproc.repository.RequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DuplicateDetectionServiceTest {

    @Mock
    private RequestRepository requestRepository;

    @InjectMocks
    private DuplicateDetectionService duplicateDetectionService;

    private Long siteId = 1L;
    private LocalDateTime baseTime;

    @BeforeEach
    void setUp() {
        baseTime = LocalDateTime.of(2024, 1, 1, 10, 0);
    }

    @Test
    @DisplayName("Should detect duplicate request with overlapping timeline and materials")
    void shouldDetectDuplicateRequest() {
        // Arrange
        List<String> materials = List.of("Cement", "Sand");
        LocalDateTime start = baseTime;
        LocalDateTime end = baseTime.plusDays(10);

        Site site = new Site();
        site.setId(siteId);
        site.setName("Test Site");

        Request existingRequest = new Request();
        existingRequest.setId(100L);
        existingRequest.setTitle("Existing Request");
        existingRequest.setBoqReferenceCode("BOQ-001");
        existingRequest.setPlannedStartDate(start.plusDays(2)); // Start 2 days later
        existingRequest.setPlannedEndDate(end.plusDays(2)); // End 2 days later
        existingRequest.setStatus(RequestStatus.APPROVED);
        existingRequest.setSite(site);

        Material m1 = new Material();
        m1.setName("Cement");
        Material m2 = new Material();
        m2.setName("Bricks"); // Not requested
        existingRequest.setMaterials(List.of(m1, m2));

        when(requestRepository.findOverlappingRequests(eq(siteId), any(), eq(start), eq(end)))
                .thenReturn(List.of(existingRequest));

        // Act
        List<DuplicateWarningDTO> warnings = duplicateDetectionService.findPotentialDuplicates(
                siteId, materials, start, end);

        // Assert
        assertThat(warnings).hasSize(1);
        DuplicateWarningDTO warning = warnings.get(0);
        assertThat(warning.getRequestId()).isEqualTo(100L);
        assertThat(warning.getOverlappingMaterials()).containsExactly("Cement");
        assertThat(warning.getTimelineOverlapPercentage()).isGreaterThan(0);
    }

    @Test
    @DisplayName("Should return empty list when no duplicates found")
    void shouldReturnEmptyWhenNoDuplicates() {
        // Arrange
        when(requestRepository.findOverlappingRequests(any(), any(), any(), any()))
                .thenReturn(new ArrayList<>());

        // Act
        List<DuplicateWarningDTO> warnings = duplicateDetectionService.findPotentialDuplicates(
                siteId, List.of("Cement"), baseTime, baseTime.plusDays(5));

        // Assert
        assertThat(warnings).isEmpty();
    }

    @Test
    @DisplayName("Should handle case-insensitive material matching")
    void shouldHandleCaseInsensitivematching() {
        // Arrange
        List<String> materials = List.of("cement"); // Lowercase check

        Site site = new Site();
        site.setName("Test Site");

        Request existing = new Request();
        existing.setId(101L);
        existing.setSite(site);
        existing.setStatus(RequestStatus.PENDING);
        existing.setPlannedStartDate(baseTime);
        existing.setPlannedEndDate(baseTime.plusDays(5));

        Material m = new Material();
        m.setName("Cement"); // Uppercase in DB
        existing.setMaterials(List.of(m));

        when(requestRepository.findOverlappingRequests(any(), any(), any(), any()))
                .thenReturn(List.of(existing));

        // Act
        List<DuplicateWarningDTO> warnings = duplicateDetectionService.findPotentialDuplicates(
                siteId, materials, baseTime, baseTime.plusDays(5));

        // Assert
        assertThat(warnings).hasSize(1);
        assertThat(warnings.get(0).getOverlappingMaterials()).contains("Cement");
    }
}
