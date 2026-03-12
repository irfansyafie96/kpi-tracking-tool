package com.kpi.backend.controller;

import com.kpi.backend.model.ProjectMember;
import com.kpi.backend.service.ProjectMemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ProjectMemberController {

    private final ProjectMemberService memberService;

    public ProjectMemberController(ProjectMemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping("/projects/{projectId}/members")
    public List<ProjectMember> getMembersByProject(@PathVariable Long projectId) {
        return memberService.getMembersByProject(projectId);
    }

    @GetMapping("/members")
    public List<ProjectMember> getAllMembers() {
        return memberService.getAllMembers();
    }

    @PostMapping("/projects/{projectId}/members")
    public ProjectMember addMember(@PathVariable Long projectId, @RequestBody ProjectMember member) {
        return memberService.addMember(projectId, member.getMemberName(), member.getRole());
    }

    @DeleteMapping("/members/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }
}
