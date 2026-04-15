import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
import type { KpiMetric } from "@/types";

export function KpiSetupPage() {
  const navigate = useNavigate();
  const [kpiData, setKpiData] = useState<
    Record<string, { kra_weight: number; metrics: KpiMetric[] }>
  >({});
  const [editMetric, setEditMetric] = useState<KpiMetric | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    kra_name: "",
    kra_weight: 0,
    metric_name: "",
    evidence: "",
    metric_weight: 0,
    rubric_json: "",
    requires_file: false,
    display_order: 0,
  });
  const [validation, setValidation] = useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    api
      .get("/kpi-metrics/grouped")
      .then((r) => setKpiData(r.data))
      .catch(console.error);
    api
      .get("/kpi-metrics/validate")
      .then((r) => setValidation(r.data))
      .catch(console.error);
  };

  const openCreate = () => {
    setEditMetric(null);
    setForm({
      kra_name: "",
      kra_weight: 0,
      metric_name: "",
      evidence: "",
      metric_weight: 0,
      rubric_json: '{"1":"","2":"","3":"","4":"","5":""}',
      requires_file: false,
      display_order: 0,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (m: KpiMetric) => {
    setEditMetric(m);
    setForm({
      kra_name: m.kra_name,
      kra_weight: m.kra_weight,
      metric_name: m.metric_name,
      evidence: m.evidence || "",
      metric_weight: m.metric_weight,
      rubric_json: m.rubric_json || "",
      requires_file: m.requires_file,
      display_order: m.display_order,
    });
    setIsDialogOpen(true);
  };

  const save = async () => {
    try {
      if (editMetric) {
        await api.put(`/kpi-metrics/${editMetric.id}`, form);
      } else {
        await api.post("/kpi-metrics", form);
      }
      setIsDialogOpen(false);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMetric = async (id: number) => {
    if (!confirm("Delete this metric?")) return;
    await api.delete(`/kpi-metrics/${id}`);
    load();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KPI Setup</h1>
          <p className="text-gray-500 text-sm">Manage KPI framework</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/pd")}>
            Back
          </Button>
          <Button onClick={openCreate}>+ Add Metric</Button>
        </div>
      </div>

      {/* New card showing KRA weights */}
      <Card>
        <CardHeader>
          <CardTitle>KRA Weight Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(kpiData).map(([kra, { kra_weight }]) => (
            <div key={kra} className="flex justify-between items-center py-1">
              <span>{kra}</span>
              <Badge variant={kra_weight === 20 ? "success" : "warning"}>
                {kra_weight}%
              </Badge>
            </div>
          ))}
          <hr className="-mx-6 border-gray-400" />
          <div className="flex justify-between items-center pt-3">
            <span className="font-semibold">Total</span>
            <Badge variant="default">100%</Badge>
          </div>
        </CardContent>
      </Card>
      {Object.entries(kpiData).map(([kraName, group]) => (
        <Card key={kraName}>
          <CardHeader>
            <CardTitle>
              {kraName} <Badge variant="outline">{group.kra_weight}%</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {group.metrics.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium">{m.metric_name}</p>
                    <p className="text-xs text-gray-500">
                      Evidence: {m.evidence} | Weight: {m.metric_weight}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(m)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => deleteMetric(m.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>{editMetric ? "Edit Metric" : "Add Metric"}</DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                KRA Name
              </label>
              <Input
                value={form.kra_name}
                onChange={(e) => setForm({ ...form, kra_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                KRA Weight %
              </label>
              <Input
                type="number"
                value={form.kra_weight}
                onChange={(e) =>
                  setForm({ ...form, kra_weight: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metric Name
            </label>
            <Input
              value={form.metric_name}
              onChange={(e) =>
                setForm({ ...form, metric_name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Evidence
            </label>
            <Input
              value={form.evidence}
              onChange={(e) => setForm({ ...form, evidence: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metric Weight
              </label>
              <Input
                type="number"
                value={form.metric_weight}
                onChange={(e) =>
                  setForm({ ...form, metric_weight: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <Input
                type="number"
                value={form.display_order}
                onChange={(e) =>
                  setForm({ ...form, display_order: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rubric JSON
            </label>
            <Textarea
              value={form.rubric_json}
              onChange={(e) =>
                setForm({ ...form, rubric_json: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresFile"
              checked={form.requires_file}
              onChange={(e) =>
                setForm({ ...form, requires_file: e.target.checked })
              }
            />
            <label htmlFor="requiresFile" className="text-sm">
              Requires File
            </label>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{editMetric ? "Update" : "Create"}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
