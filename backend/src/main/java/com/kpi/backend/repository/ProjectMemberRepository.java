package com.kpi.backend.repository;

import com.kpi.backend.model.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    
    List<ProjectMember> findByProjectId(Long projectId);
    
    List<ProjectMember> findByRole(String role);
    
    List<ProjectMember> findByProjectIdAndRole(Long projectId, String role);
}
