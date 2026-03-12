package com.kpi.backend.repository;

import com.kpi.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    List<Project> findByProjectName(String projectName);
}
