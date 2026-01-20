package com.zilla.eproc.model;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for new Project entity fields and related entities.
 */
class ProjectEntityTest {

    @Test
    void projectAssignment_isCurrentlyActive_whenActiveAndNoEndDate() {
        ProjectAssignment assignment = ProjectAssignment.builder()
                .isActive(true)
                .endDate(null)
                .build();

        assertThat(assignment.isCurrentlyActive()).isTrue();
    }

    @Test
    void projectAssignment_isNotActive_whenIsActiveFalse() {
        ProjectAssignment assignment = ProjectAssignment.builder()
                .isActive(false)
                .endDate(null)
                .build();

        assertThat(assignment.isCurrentlyActive()).isFalse();
    }

    @Test
    void projectAssignment_isNotActive_whenEndDatePast() {
        ProjectAssignment assignment = ProjectAssignment.builder()
                .isActive(true)
                .endDate(LocalDate.now().minusDays(1))
                .build();

        assertThat(assignment.isCurrentlyActive()).isFalse();
    }

    @Test
    void projectAssignment_isActive_whenEndDateFuture() {
        ProjectAssignment assignment = ProjectAssignment.builder()
                .isActive(true)
                .endDate(LocalDate.now().plusDays(1))
                .build();

        assertThat(assignment.isCurrentlyActive()).isTrue();
    }

    @Test
    void project_hasNewFieldsSet() {
        Project project = Project.builder()
                .name("Test Project")
                .code("PRJ-2026-001")
                .industry(Industry.HOTEL)
                .projectType(ProjectType.CONSTRUCTION)
                .ownerRepName("John Doe")
                .ownerRepContact("+255123456789")
                .plotNumber("Plot 123")
                .gpsCoordinates("-6.7924,39.2083")
                .titleDeedAvailable(true)
                .siteAccessNotes("Access via main road")
                .keyObjectives("Build a 5-star hotel")
                .expectedOutput("40-room hotel with restaurant")
                .startDate(LocalDate.of(2026, 1, 1))
                .expectedCompletionDate(LocalDate.of(2027, 12, 31))
                .contractType(ContractType.LUMP_SUM)
                .defectsLiabilityPeriod(12)
                .performanceSecurityRequired(true)
                .build();

        assertThat(project.getCode()).isEqualTo("PRJ-2026-001");
        assertThat(project.getIndustry()).isEqualTo(Industry.HOTEL);
        assertThat(project.getProjectType()).isEqualTo(ProjectType.CONSTRUCTION);
        assertThat(project.getOwnerRepName()).isEqualTo("John Doe");
        assertThat(project.getTitleDeedAvailable()).isTrue();
        assertThat(project.getContractType()).isEqualTo(ContractType.LUMP_SUM);
        assertThat(project.getDefectsLiabilityPeriod()).isEqualTo(12);
    }

    @Test
    void projectScope_buildsCorrectly() {
        ProjectScope scope = ProjectScope.builder()
                .category(ScopeCategory.CIVIL_STRUCTURAL)
                .description("Foundation and structure")
                .isIncluded(true)
                .notes("Standard reinforced concrete")
                .build();

        assertThat(scope.getCategory()).isEqualTo(ScopeCategory.CIVIL_STRUCTURAL);
        assertThat(scope.getIsIncluded()).isTrue();
    }

    @Test
    void projectMilestone_buildsCorrectly() {
        ProjectMilestone milestone = ProjectMilestone.builder()
                .name("Foundation Complete")
                .deadline(LocalDate.of(2026, 6, 30))
                .status(MilestoneStatus.PENDING)
                .approvalRequired(true)
                .build();

        assertThat(milestone.getName()).isEqualTo("Foundation Complete");
        assertThat(milestone.getStatus()).isEqualTo(MilestoneStatus.PENDING);
        assertThat(milestone.getApprovalRequired()).isTrue();
    }

    @Test
    void projectDocument_buildsCorrectly() {
        ProjectDocument document = ProjectDocument.builder()
                .name("Architectural Drawings v1")
                .type(DocumentType.DRAWING)
                .url("https://storage.example.com/docs/arch-v1.pdf")
                .version(1)
                .status(DocumentStatus.DRAFT)
                .fileSize(1024000L)
                .mimeType("application/pdf")
                .build();

        assertThat(document.getType()).isEqualTo(DocumentType.DRAWING);
        assertThat(document.getStatus()).isEqualTo(DocumentStatus.DRAFT);
        assertThat(document.getVersion()).isEqualTo(1);
    }

    @Test
    void user_hasNewFields() {
        User user = User.builder()
                .email("eng@test.com")
                .name("Engineer")
                .phoneNumber("+255123456789")
                .title("Senior Site Engineer")
                .erbNumber("ERB-12345")
                .role(Role.ENGINEER)
                .build();

        assertThat(user.getPhoneNumber()).isEqualTo("+255123456789");
        assertThat(user.getTitle()).isEqualTo("Senior Site Engineer");
        assertThat(user.getErbNumber()).isEqualTo("ERB-12345");
    }
}
