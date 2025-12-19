package com.zilla.eproc.repository;

import com.zilla.eproc.model.Role;
import com.zilla.eproc.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for User entity database operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their email address.
     * 
     * @param email the email to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a user exists with the given email.
     * 
     * @param email the email to check
     * @return true if a user exists with this email
     */
    boolean existsByEmail(String email);

    /**
     * Find users by role.
     */
    List<User> findByRole(Role role);

    /**
     * Find active users by role.
     */
    List<User> findByRoleAndActiveTrue(Role role);

    /**
     * Find engineers who are not assigned to any ACTIVE project.
     * These engineers are available for assignment.
     */
    @Query("SELECT u FROM User u WHERE u.role = 'ENGINEER' AND u.active = true " +
            "AND NOT EXISTS (SELECT p FROM Project p WHERE p.engineer = u AND p.status = 'ACTIVE')")
    List<User> findAvailableEngineers();
}
