package com.kpi.backend.service;

import com.kpi.backend.model.ProjectMember;
import com.kpi.backend.repository.ProjectMemberRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProjectMemberService {

    private final ProjectMemberRepository memberRepository;

    public ProjectMemberService(ProjectMemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    public ProjectMember addMember(Long projectId, String memberName, String role) {
        ProjectMember member = new ProjectMember();
        member.setProjectId(projectId);
        member.setMemberName(memberName);
        member.setRole(role);
        return memberRepository.save(member);
    }

    public List<ProjectMember> getMembersByProject(Long projectId) {
        return memberRepository.findByProjectId(projectId);
    }

    public List<ProjectMember> getAllMembers() {
        return memberRepository.findAll();
    }

    public void deleteMember(Long id) {
        memberRepository.deleteById(id);
    }
}
