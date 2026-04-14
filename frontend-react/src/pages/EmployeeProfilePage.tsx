import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function EmployeeProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [memberSummary, setMemberSummary] = useState<any>(null);

  useEffect(() => {
    if (id && id !== "0") {
      api.get(`/dashboard/member/${id}`).then((r) => setMemberSummary(r.data)).catch(console.error);
    }
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm">{user?.name} ({user?.role})</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/")}>Back</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {memberSummary ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Evaluations</p>
                  <p className="text-2xl font-bold">{memberSummary.total_evaluations}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Latest Score</p>
                  <p className="text-2xl font-bold">{parseFloat(memberSummary.latest_score || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <Badge variant={memberSummary.latest_rating === "Outstanding" || memberSummary.latest_rating === "Good" ? "success" : "warning"}>
                    {memberSummary.latest_rating}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Latest Evaluation</p>
                  <p className="text-sm">
                    {memberSummary.latest_evaluation_date ? new Date(memberSummary.latest_evaluation_date).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">KRA Scores</p>
                <div className="space-y-1">
                  {Object.entries(memberSummary.kra_scores || {}).map(([kra, score]) => (
                    <div key={kra} className="flex justify-between text-sm">
                      <span className="text-gray-600">{kra}</span>
                      <span className="font-medium">{(score as number).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No evaluation data found. Your PM will evaluate you after project milestones.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
