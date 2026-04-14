import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [memberSummary, setMemberSummary] = useState<any>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [kraScores, setKraScores] = useState<Record<string, number>>({});

  const radarData = {
    labels: ["Lead Discovery", "Team Building", "Communication", "Prioritization", "Problem Solving", "Process Efficiency"],
    datasets: [
      {
        data: [
          kraScores["Lead Discovery"] || 0,
          kraScores["Team Building"] || 0,
          kraScores["Communication"] || 0,
          kraScores["Prioritization"] || 0,
          kraScores["Problem Solving"] || 0,
          kraScores["Process Efficiency"] || 0,
        ],
        backgroundColor: "rgba(15, 76, 92, 0.2)",
        borderColor: "#0f4c5c",
        pointBackgroundColor: "#0f4c5c",
      },
    ],
  };

  useEffect(() => {
    api.get("/projects").then((r) => setProjects(r.data)).catch(console.error);
    api.get("/dashboard/summary").then((r) => setSummary(r.data)).catch(console.error);
  }, []);

  const onProjectChange = () => {
    setSelectedMemberId(null);
    setMemberSummary(null);
    setKraScores({});
    if (!selectedProjectId) return;
    api.get(`/projects/${selectedProjectId}/members`).then((r) => setMembers(r.data)).catch(console.error);
    api.get(`/dashboard/project/${selectedProjectId}`).then((r) => {
      if (r.data.members_evaluated > 0) {
        setSummary({
          total_evaluations: r.data.members_evaluated,
          average_score: r.data.member_scores.reduce((s: number, m: any) => s + parseFloat(m.latest_score), 0) / r.data.member_scores.length,
          rating_breakdown: r.data.member_scores.reduce((acc: any, m: any) => {
            acc[m.latest_rating] = (acc[m.latest_rating] || 0) + 1;
            return acc;
          }, {}),
        });
      }
    }).catch(console.error);
  };

  const onMemberChange = () => {
    if (!selectedMemberId) return;
    api.get(`/dashboard/member/${selectedMemberId}`).then((r) => setMemberSummary(r.data)).catch(console.error);
    api.get(`/dashboard/kra-scores/member/${selectedMemberId}`).then((r) => setKraScores(r.data)).catch(console.error);
  };

  const createProject = () => {
    if (!newProjectName.trim()) return;
    api.post("/projects", { project_name: newProjectName }).then((r) => {
      setProjects([...projects, r.data]);
      setNewProjectName("");
      setShowCreateProject(false);
      setSelectedProjectId(r.data.id);
      onProjectChange();
    }).catch(console.error);
  };

  const getRatingBadge = (rating: string) => {
    const map: Record<string, string> = {
      Outstanding: "success",
      Good: "success",
      Average: "warning",
      Poor: "danger",
    };
    return map[rating] || "outline";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Director Dashboard</h1>
          <p className="text-gray-500 text-sm">Monitor BA/QA performance across projects</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/")}>Back</Button>
          <Button variant="outline" onClick={() => navigate("/pd/kpi-setup")}>KPI Setup</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <Select value={selectedProjectId || ""} onChange={(e) => { setSelectedProjectId(Number(e.target.value)); onProjectChange(); }}>
                <option value="">All Projects</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.project_name}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <Select value={selectedMemberId || ""} onChange={(e) => { setSelectedMemberId(Number(e.target.value)); onMemberChange(); }} disabled={!selectedProjectId}>
                <option value="">Select Employee</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.member_name} ({m.role})</option>)}
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={() => setShowCreateProject(!showCreateProject)}>
                {showCreateProject ? "Cancel" : "+ Create Project"}
              </Button>
            </div>
          </div>
          {showCreateProject && (
            <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <Input placeholder="Project name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
              <Button onClick={createProject}>Create</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Total Evaluations</p>
            <p className="text-3xl font-bold text-teal-600 mt-1">{summary?.total_evaluations || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wide">Average Score</p>
            <p className="text-3xl font-bold text-teal-600 mt-1">{(summary?.average_score || 0).toFixed(2)}</p>
            <p className="text-xs text-gray-400">out of 4.0</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 uppercase tracking-wide text-center mb-3">Rating Breakdown</p>
            <div className="flex justify-around">
              {["Outstanding", "Good", "Average", "Poor"].map((r) => (
                <div key={r} className="text-center">
                  <span className="block text-xl font-bold">{summary?.rating_breakdown?.[r] || 0}</span>
                  <span className="text-xs text-gray-500">{r}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {memberSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Performance Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Latest Score</p>
                <p className="text-2xl font-bold">{parseFloat(memberSummary.latest_score || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <Badge variant={getRatingBadge(memberSummary.latest_rating) as any}>{memberSummary.latest_rating}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Evaluation Date</p>
                <p className="text-sm">{memberSummary.latest_evaluation_date ? new Date(memberSummary.latest_evaluation_date).toLocaleDateString() : "N/A"}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">KRA Performance</p>
                <Radar data={radarData} options={{ scales: { r: { min: 0, max: 5, ticks: { stepSize: 1 } } } }} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">KRA Scores</p>
                <div className="space-y-2">
                  {Object.entries(kraScores).map(([kra, score]) => (
                    <div key={kra} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{kra}</span>
                      <span className="text-sm font-medium">{(score as number).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
