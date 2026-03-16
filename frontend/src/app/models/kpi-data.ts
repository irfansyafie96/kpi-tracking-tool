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
          1: '1% - Less than 20% requirements ready',
          2: '2% - 20-40% requirements ready',
          3: '3% - 41-60% requirements ready',
          4: '4% - 61-80% requirements ready',
          5: '5% - 81-100% requirements ready'
        }
      },
      {
        name: '% of test scenarios identified before QA phase',
        evidence: 'Test Script',
        weight: 5,
        rubric: {
          1: '1% - Less than 20% scenarios identified',
          2: '2% - 20-40% scenarios identified',
          3: '3% - 41-60% scenarios identified',
          4: '4% - 61-80% scenarios identified',
          5: '5% - 81-100% scenarios identified'
        }
      },
      {
        name: 'Early risk logs',
        evidence: 'Risk register / Redmine',
        weight: 5,
        rubric: {
          1: '1% - No proactive risk identification',
          2: '2% - Risks identified late with unclear mitigation',
          3: '3% - Risks logged with mitigation but some delays',
          4: '4% - Most risks identified early with clear mitigation',
          5: '5% - All risks identified early with full tracking'
        }
      },
      {
        name: 'Stakeholder clarity feedback',
        evidence: 'Stakeholder survey form',
        weight: 5,
        rubric: {
          1: '1% - Very negative feedback',
          2: '2% - Negative feedback',
          3: '3% - Neutral feedback',
          4: '4% - Positive feedback',
          5: '5% - Very positive feedback, high satisfaction'
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
          1: '1% - Poor collaboration, frequent conflicts',
          2: '2% - Some collaboration issues',
          3: '3% - Good collaboration, minor issues',
          4: '4% - Very good collaboration',
          5: '5% - Excellent collaboration, proactive engagement'
        }
      },
      {
        name: 'Mentorship provided',
        evidence: 'Evaluation Form (for Mentor & Mentee)',
        weight: 5,
        rubric: {
          1: '1% - No mentorship provided',
          2: '2% - Limited mentorship, inconsistent',
          3: '3% - Good mentorship when asked',
          4: '4% - Regular mentorship provided',
          5: '5% - Proactive mentorship, regular guidance'
        }
      },
      {
        name: 'Support during crunch periods',
        evidence: 'Based on observation',
        weight: 5,
        rubric: {
          1: '1% - Unavailable during crunch periods',
          2: '2% - Limited support when needed',
          3: '3% - Available when asked',
          4: '4% - Mostly available during crunch',
          5: '5% - Proactively supports team during crunch'
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
          1: '1% - High rework rate (>40%)',
          2: '2% - Moderate rework rate (21-40%)',
          3: '3% - Low rework rate (11-20%)',
          4: '4% - Very low rework rate (1-10%)',
          5: '5% - No rework due to requirement issues'
        }
      },
      {
        name: 'Defect clarity',
        evidence: 'Email/Redmine response timestamps & format',
        weight: 5,
        rubric: {
          1: '1% - Poor response time, unclear communication',
          2: '2% - Slow responses, unclear communication',
          3: '3% - Generally timely with minor issues',
          4: '4% - Good response time, clear communication',
          5: '5% - Very timely, clear and professional'
        }
      },
      {
        name: 'Response time to questions',
        evidence: 'Feedback from team',
        weight: 5,
        rubric: {
          1: '1% - Very slow, often ignores questions',
          2: '2% - Slow response, needs follow-ups',
          3: '3% - Generally responsive',
          4: '4% - Quick response',
          5: '5% - Immediate response, always available'
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
          1: '1% - No prioritization based on risk',
          2: '2% - Poor prioritization, random order',
          3: '3% - Basic prioritization applied',
          4: '4% - Good risk-based prioritization',
          5: '5% - Excellent risk-based prioritization'
        }
      },
      {
        name: 'Handling scope changes',
        evidence: 'CR Form / Redmine',
        weight: 5,
        rubric: {
          1: '1% - Poorly documented, missing approvals',
          2: '2% - Limited impact analysis, incomplete docs',
          3: '3% - Proper documentation, minor missing details',
          4: '4% - Good documentation with impact analysis',
          5: '5% - Detailed documentation with full approval'
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
          1: '1% - Excessive escalations',
          2: '2% - Frequent escalations',
          3: '3% - Some escalations',
          4: '4% - Few escalations',
          5: '5% - Rare escalations',
          6: '6% - Very rare escalations',
          7: '7% - Minimal escalations, solves issues independently'
        }
      },
      {
        name: 'Time taken to resolve blockers',
        evidence: 'Escalation logs',
        weight: 7,
        rubric: {
          1: '1% - Blockers remain unresolved',
          2: '2% - Slow to resolve blockers',
          3: '3% - Takes time to resolve blockers',
          4: '4% - Mostly timely resolution',
          5: '5% - Good resolution time',
          6: '6% - Quick resolution',
          7: '7% - Immediate resolution, no blockers'
        }
      },
      {
        name: 'Ability to negotiate requirement conflicts',
        evidence: 'Meeting notes / Emails / Text Messages',
        weight: 6,
        rubric: {
          1: '1% - Cannot resolve conflicts',
          2: '2% - Struggles with conflicts',
          3: '3% - Handles conflicts reasonably',
          4: '4% - Good conflict resolution',
          5: '5% - Very good negotiation skills',
          6: '6% - Excellent negotiation, resolves effectively'
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
          1: '1% - Very high rework rate',
          2: '2% - High rework rate',
          3: '3% - Moderate rework rate',
          4: '4% - Low rework rate',
          5: '5% - Very low rework rate',
          6: '6% - Minimal rework',
          7: '7% - Minimal to no rework'
        }
      },
      {
        name: 'On-time documentation',
        evidence: 'Documentation submission logs / One Drive timestamps',
        weight: 7,
        rubric: {
          1: '1% - Frequently late',
          2: '2% - Often late',
          3: '3% - Sometimes late',
          4: '4% - Usually on time',
          5: '5% - Mostly on time',
          6: '6% - Almost always on time',
          7: '7% - Always on time, early when possible'
        }
      },
      {
        name: 'Test deliverable timeline',
        evidence: 'QA cycle delays linked to BA / Test Script',
        weight: 6,
        rubric: {
          1: '1% - Significant delays',
          2: '2% - Frequent delays',
          3: '3% - Some delays',
          4: '4% - Minor delays occasionally',
          5: '5% - Mostly on time',
          6: '6% - Usually on time'
        }
      }
    ]
  }
];
