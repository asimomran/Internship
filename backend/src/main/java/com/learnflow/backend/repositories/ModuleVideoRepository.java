package com.learnflow.backend.repositories;

import com.learnflow.backend.models.ModuleVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleVideoRepository extends JpaRepository<ModuleVideo, Long> {
    List<ModuleVideo> findByModuleIdOrderBySequenceOrderAsc(Long moduleId);
    long countByModuleCourseId(Long courseId);
}

