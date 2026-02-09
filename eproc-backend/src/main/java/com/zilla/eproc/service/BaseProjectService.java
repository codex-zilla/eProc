package com.zilla.eproc.service;

import com.zilla.eproc.model.ProjectRole;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public abstract class BaseProjectService {

    protected ProjectSecurityService projectSecurityService;

    @Autowired
    public void setProjectSecurityService(ProjectSecurityService projectSecurityService) {
        this.projectSecurityService = projectSecurityService;
    }

    /**
     * checkAccess enforces that the current user has access to the project.
     * It delegates to ProjectSecurityService for the actual logic.
     */
    protected void checkAccess(String email, Long projectId, ProjectRole... requiredRoles) {
        if (projectSecurityService == null) {
            throw new IllegalStateException("ProjectSecurityService not injected");
        }
        projectSecurityService.validateProjectAccess(email, projectId, requiredRoles);
    }

    protected void checkOwner(String email, Long projectId) {
        if (projectSecurityService == null) {
            throw new IllegalStateException("ProjectSecurityService not injected");
        }
        projectSecurityService.validateProjectOwner(email, projectId);
    }
}
