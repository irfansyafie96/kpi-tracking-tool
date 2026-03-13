export interface KRA {
  name: string;
  weight: number;
  metrics: Metric[];
}

export interface Metric {
  name: string;
  evidence: string;
  weight: number;
  rubric: { [key: number]: string };
}

export const KPI_DATA: KRA[] = [
  {
    name: 'Lead Discovery',
    weight: 20,
    metrics: [
      {
        name: '% of requirements ready before dev starts',
        evidence: 'BRD / FSD',
        weight: 5,
        rubric: {
          1: 'Incomplete, unclear',
          2: 'Several unclear sections, multiple revisions required',
          3: 'Mostly clear with minor missing details, few clarifications required',
          4: 'Very clear, complete requirements, stakeholder approved, minimal revisions needed'
        }
      },
      {
        name: '% of test scenarios identified before QA phase',
        evidence: 'Test Script',
        weight: 5,
        rubric: {
          1: 'Poor coverage, unclear or incomplete test cases',
          2: 'Limited coverage and unclear steps',
          3: 'Good coverage but minor scenarios missing',
          4: 'Full coverage of requirements with clear steps and expected results'
        }
      },
      {
        name: 'Early risk logs',
        evidence: 'Risk register / Redmine',
        weight: 5,
        rubric: {
          1: 'No proactive risk identification',
          2: 'Risks identified late or mitigation unclear',
          3: 'Risks logged with mitigation but some delays',
          4: 'Risks identified early with clear mitigation and tracking'
        }
      },
      {
        name: 'Stakeholder clarity feedback',
        evidence: 'Stakeholder survey form',
        weight: 5,
        rubric: {
          1: 'Negative feedback from stakeholders',
          2: 'Mixed feedback with notable concerns',
          3: 'Generally positive with minor improvement areas',
          4: 'Very positive feedback and high satisfaction'
        }
      }
    ]
  },
  {
    name: 'Team Building',
    weight: 15,
    metrics: [
      {
        name: 'Collaboration with BA/dev',
        evidence: 'Feedback from team',
        weight: 5,
        rubric: {
          1: 'Poor collaboration, frequent conflicts',
          2: 'Some collaboration issues',
          3: 'Good collaboration, minor issues',
          4: 'Excellent collaboration, proactive engagement'
        }
      },
      {
        name: 'Mentorship provided',
        evidence: 'Evaluation Form (for Mentor & Mentee)',
        weight: 5,
        rubric: {
          1: 'No mentorship provided',
          2: 'Limited mentorship, inconsistent',
          3: 'Good mentorship when asked',
          4: 'Proactive mentorship, regular guidance'
        }
      },
      {
        name: 'Support during crunch periods',
        evidence: 'Based on observation',
        weight: 5,
        rubric: {
          1: 'Unavailable during crunch periods',
          2: 'Limited support when needed',
          3: 'Available when asked',
          4: 'Proactively supports team during crunch'
        }
      }
    ]
  },
  {
    name: 'Communication',
    weight: 15,
    metrics: [
      {
        name: 'Rework due to unclear requirements',
        evidence: 'Defect re-open rate (ticket)',
        weight: 5,
        rubric: {
          1: 'High reopen rate (>10%)',
          2: 'Moderate reopen rate (5–10%)',
          3: 'Low reopen rate (<5%)',
          4: 'No defect reopens due to requirement issues'
        }
      },
      {
        name: 'Defect clarity',
        evidence: 'Email/Redmine response timestamps & format',
        weight: 5,
        rubric: {
          1: 'Poor response time and communication quality',
          2: 'Slow responses or unclear communication',
          3: 'Generally timely with minor delays',
          4: 'Very timely, clear and professional communication'
        }
      },
      {
        name: 'Response time to questions',
        evidence: 'Feedback from team',
        weight: 5,
        rubric: {
          1: 'Very slow, often ignores questions',
          2: 'Slow response, needs follow-ups',
          3: 'Generally responsive',
          4: 'Immediate response, always available'
        }
      }
    ]
  },
  {
    name: 'Prioritization',
    weight: 10,
    metrics: [
      {
        name: 'Risk-based prioritization',
        evidence: 'SLA / Redmine priority',
        weight: 5,
        rubric: {
          1: 'No prioritization based on risk',
          2: 'Poor prioritization, random order',
          3: 'Basic prioritization applied',
          4: 'Excellent risk-based prioritization'
        }
      },
      {
        name: 'Handling scope changes',
        evidence: 'CR Form / Redmine',
        weight: 5,
        rubric: {
          1: 'Poorly documented or missing approvals',
          2: 'Limited impact analysis or incomplete documentation',
          3: 'Proper documentation with minor missing details',
          4: 'Detailed documentation with full impact analysis and approval'
        }
      }
    ]
  },
  {
    name: 'Problem Solving',
    weight: 20,
    metrics: [
      {
        name: 'Escalation frequency',
        evidence: 'Ticket / Redmine',
        weight: 7,
        rubric: {
          1: 'Excessive escalations, cannot solve issues',
          2: 'Frequent escalations',
          3: 'Occasional escalations when needed',
          4: 'Minimal escalations, solves most issues independently'
        }
      },
      {
        name: 'Time taken to resolve blockers',
        evidence: 'Escalation logs',
        weight: 7,
        rubric: {
          1: 'Blockers remain unresolved for long',
          2: 'Slow to resolve blockers',
          3: 'Timely resolution of blockers',
          4: 'Immediate resolution, no blockers'
        }
      },
      {
        name: 'Ability to negotiate requirement conflicts',
        evidence: 'Meeting notes / Emails / Text Messages',
        weight: 6,
        rubric: {
          1: 'Cannot resolve conflicts',
          2: 'Struggles with conflicts',
          3: 'Handles conflicts reasonably',
          4: 'Excellent negotiation skills, resolves conflicts effectively'
        }
      }
    ]
  },
  {
    name: 'Process Efficiency',
    weight: 20,
    metrics: [
      {
        name: 'Rework rate',
        evidence: 'Ticket / Redmine',
        weight: 7,
        rubric: {
          1: 'High rework rate',
          2: 'Moderate rework rate',
          3: 'Low rework rate',
          4: 'Minimal to no rework'
        }
      },
      {
        name: 'On-time documentation',
        evidence: 'Documentation submission logs / One Drive timestamps',
        weight: 7,
        rubric: {
          1: 'Frequently late with documentation',
          2: 'Sometimes late',
          3: 'Usually on time',
          4: 'Always on time, early when possible'
        }
      },
      {
        name: 'Test deliverable timeline',
        evidence: 'QA cycle delays linked to BA / Test Script',
        weight: 6,
        rubric: {
          1: 'Significant delays in deliverables',
          2: 'Frequent delays',
          3: 'Minor delays occasionally',
          4: 'Delivers on time consistently'
        }
      }
    ]
  }
];
