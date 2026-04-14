import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { KpiGroup, Project, ProjectMember, EvaluationDetailSubmit } from "@/types";

export function PmEvaluationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kpiData, setKpiData] = useState<Record<string, KpiGroup>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [evaluatorName, setEvaluatorName] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"BA" | "QA">("BA");
  const [showAddMember, setShowAddMember] = useState(false);
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    api.get("/kpi-metrics/grouped").then((r) => setKpiData(r.data)).catch(console.error);
    api.get("/projects").then((r) => setProjects(r.data)).catch(console.error);
  }, []);

  const onProjectChange = () => {
    setSelectedMemberId(null);
    setMembers([]);
    if (!selectedProjectId) return;
    api.get(`/projects/${selectedProjectId}/members`).then((r) => setMembers(r.data)).catch(console.error);
  };

  const addMember = () => {
    if (!newMemberName.trim() || !selectedProjectId) return;
    api.post(`/projects/${selectedProjectId}/members`, { member_name: newMemberName, role: newMemberRole }).then((r) => {
      setMembers([...members, r.data]);
      setNewMemberName("");
      setShowAddMember(false);
    }).catch(console.error);
  };

  const getScoreKey = (kra: string, metric: string) => `${kra}::${metric}`;

  const getScore = (kra: string, metric: string) => {
    const key = getScoreKey(kra, metric);
    return scores[key] ?? null;
  };

  const setScore = (kra: string, metric: string, value: number) => {
    setScores((prev) => ({ ...prev, [getScoreKey(kra, metric)]: value }));
  };

  const getRemark = (kra: string, metric: string) => remarks[`${kra}::${metric}`] || "";

  const setRemark = (kra: string, metric: string, value: string) => {
    setRemarks((prev) => ({ ...prev, [`${kra}::${metric}`]: value }));
  };

  const completedCount = Object.values(scores).filter((v) => v !== null).length;
  const totalMetrics = Object.values(kpiData).reduce((sum, g) => sum + g.metrics.length, 0);
  const isFormValid = selectedProjectId && selectedMemberId && evaluatorName.trim() && completedCount === totalMetrics;

  const submitEvaluation = async () => {
    if (!isFormValid || !selectedMemberId) return;
    setIsSubmitting(true);
    const details: EvaluationDetailSubmit[] = [];
    for (const [key, group] of Object.entries(kpiData)) {
      for (const m of group.metrics) {
        const score = scores[getScoreKey(key, m.metric_name)];
        if (score !== null) {
          details.push({
            metric_id: m.id,
            kra_name: m.kra_name,
            metric_name: m.metric_name,
            evidence_reviewed: m.evidence,
            percentage_score: score,
            evidence_remarks: getRemark(key, m.metric_name) || null,
            file_path: null,
          });
        }
      }
    }
    try {
      await api.post("/evaluations", { member_id: selectedMemberId, evaluator_name: evaluatorName, details });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PM Evaluation</h1>
          <p className="text-gray-500 text-sm">Evaluate BA/QA team members</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/")}>Back</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Project & Employee</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <Select value={selectedProjectId || ""} onChange={(e) => { setSelectedProjectId(Number(e.target.value)); onProjectChange(); }}>
                <option value="">Select Project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.project_name}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <Select value={selectedMemberId || ""} onChange={(e) => setSelectedMemberId(Number(e.target.value))} disabled={!selectedProjectId}>
                <option value="">Select Employee</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.member_name} ({m.role})</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Evaluator Name</label>
              <Input value={evaluatorName} onChange={(e) => setEvaluatorName(e.target.value)} placeholder="Your name" />
            </div>
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={() => setShowAddMember(!showAddMember)}>
              {showAddMember ? "Cancel" : "+ Add Team Member"}
            </Button>
            {showAddMember && (
              <div className="flex gap-3 mt-3 p-3 bg-gray-50 rounded-lg">
                <Input placeholder="Member name" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} />
                <Select value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value as "BA" | "QA")}>
                  <option value="BA">BA</option>
                  <option value="QA">QA</option>
                </Select>
                <Button onClick={addMember}>Add</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500">
        Progress: {completedCount}/{totalMetrics} metrics scored
      </div>

      {Object.entries(kpiData).map(([kraName, group]) => (
        <Card key={kraName}>
          <CardHeader>
            <CardTitle>{kraName} <span className="text-sm font-normal text-gray-500">(Weight: {group.kra_weight}%)</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {group.metrics.map((metric) => {
                const score = getScore(kraName, metric.metric_name);
                return (
                  <div key={metric.id} className="p-4 border border-gray-200 rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{metric.metric_name}</p>
                        <p className="text-xs text-gray-500">Evidence: {metric.evidence} | Max: {metric.metric_weight}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        min={0}
                        max={metric.metric_weight}
                        value={score ?? ""}
                        onChange={(e) => setScore(kraName, metric.metric_name, Number(e.target.value))}
                        className="w-24"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500">/ {metric.metric_weight}</span>
                    </div>
                    <Textarea
                      placeholder="Remarks (optional)"
                      value={getRemark(kraName, metric.metric_name)}
                      onChange={(e) => setRemark(kraName, metric.metric_name, e.target.value)}
                      rows={2}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {submitSuccess && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200">
          Evaluation submitted successfully!
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={submitEvaluation} disabled={!isFormValid || isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Evaluation"}
        </Button>
        <Button variant="outline" onClick={() => { setSelectedProjectId(null); setSelectedMemberId(null); setScores({}); setRemarks({}); }}>
          Reset
        </Button>
      </div>
    </div>
  );
}
