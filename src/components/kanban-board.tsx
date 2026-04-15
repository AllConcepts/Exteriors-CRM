"use client";

import { useState, useCallback, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { createClient } from "@/lib/supabase/client";
import { JOB_STAGES, STAGE_ORDER, type JobStage } from "@/lib/job-stages";

interface Job {
  id: string;
  contact_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  address: string;
  city: string;
  state: string;
  zip: string | null;
  stage: JobStage;
  job_value: number | null;
  assigned_rep: string | null;
  notes: string | null;
  lead_id: string | null;
  created_at: string;
  updated_at: string;
}

export default function KanbanBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const supabase = createClient();

  const fetchJobs = useCallback(async () => {
    const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: true });
    if (data) setJobs(data as Job[]);
  }, [supabase]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Group jobs by stage
  const jobsByStage: Record<string, Job[]> = {};
  for (const stage of STAGE_ORDER) {
    jobsByStage[stage] = jobs.filter((j) => j.stage === stage);
  }

  // Handle drag end — move card to new column
  const onDragEnd = async (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const newStage = destination.droppableId as JobStage;

    // Optimistic update — move card immediately in the UI
    setJobs((prev) =>
      prev.map((j) => (j.id === draggableId ? { ...j, stage: newStage } : j))
    );
    if (selectedJob?.id === draggableId) {
      setSelectedJob((prev) => prev ? { ...prev, stage: newStage } : null);
    }

    // Save to database
    await fetch("/api/jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: draggableId, stage: newStage }),
    });
  };

  // Save a new job
  const handleCreateJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("jobs").insert({
      created_by: user.id,
      customer_name: formData.get("customer_name") as string,
      customer_phone: (formData.get("customer_phone") as string) || null,
      customer_email: (formData.get("customer_email") as string) || null,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: (formData.get("state") as string) || "TX",
      zip: (formData.get("zip") as string) || null,
      job_value: formData.get("job_value") ? parseFloat(formData.get("job_value") as string) : null,
      assigned_rep: (formData.get("assigned_rep") as string) || null,
      notes: (formData.get("notes") as string) || null,
      stage: "new_lead",
    });

    setShowNewForm(false);
    await fetchJobs();
  };

  // Save edits to existing job
  const handleUpdateJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedJob) return;
    const form = e.currentTarget;
    const formData = new FormData(form);

    await supabase.from("jobs").update({
      customer_name: formData.get("customer_name") as string,
      customer_phone: (formData.get("customer_phone") as string) || null,
      customer_email: (formData.get("customer_email") as string) || null,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: (formData.get("state") as string) || "TX",
      zip: (formData.get("zip") as string) || null,
      job_value: formData.get("job_value") ? parseFloat(formData.get("job_value") as string) : null,
      assigned_rep: (formData.get("assigned_rep") as string) || null,
      notes: (formData.get("notes") as string) || null,
    }).eq("id", selectedJob.id);

    setIsEditing(false);
    await fetchJobs();
    // Refresh the selected job
    const { data } = await supabase.from("jobs").select("*").eq("id", selectedJob.id).single();
    if (data) setSelectedJob(data as Job);
  };

  // Quick stats
  const totalJobs = jobs.length;
  const totalValue = jobs.reduce((sum, j) => sum + (j.job_value || 0), 0);
  const closedJobs = jobsByStage["paid_and_closed"]?.length || 0;
  const closedValue = (jobsByStage["paid_and_closed"] || []).reduce((sum, j) => sum + (j.job_value || 0), 0);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Pipeline</h1>
          <p className="text-sm text-slate-600">
            {totalJobs} jobs &middot; ${totalValue.toLocaleString()} pipeline &middot; {closedJobs} closed (${closedValue.toLocaleString()})
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/dashboard/sales/library"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Item Library
          </a>
          <button
            onClick={() => { setShowNewForm(true); setSelectedJob(null); setIsEditing(false); }}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            + New Job
          </button>
        </div>
      </div>

      {/* Board + Detail Panel */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Kanban Board */}
        <div className={`flex-1 overflow-x-auto ${selectedJob || showNewForm ? "max-w-[calc(100%-380px)]" : ""}`}>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-3 pb-4" style={{ minWidth: STAGE_ORDER.length * 220 + "px" }}>
              {STAGE_ORDER.map((stage) => {
                const config = JOB_STAGES[stage];
                const stageJobs = jobsByStage[stage] || [];
                return (
                  <div key={stage} className="w-52 shrink-0">
                    {/* Column header */}
                    <div className="mb-2 flex items-center justify-between rounded-lg px-3 py-2" style={{ background: config.color }}>
                      <span className="truncate text-xs font-semibold text-white">{config.label}</span>
                      <span className="ml-1 shrink-0 rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {stageJobs.length}
                      </span>
                    </div>

                    {/* Droppable column */}
                    <Droppable droppableId={stage}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="min-h-[100px] space-y-2 rounded-lg p-1"
                          style={{
                            background: snapshot.isDraggingOver ? config.bgLight : "transparent",
                            border: snapshot.isDraggingOver ? `2px dashed ${config.borderLight}` : "2px dashed transparent",
                          }}
                        >
                          {stageJobs.map((job, index) => (
                            <Draggable key={job.id} draggableId={job.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => { setSelectedJob(job); setShowNewForm(false); setIsEditing(false); }}
                                  className="cursor-pointer rounded-lg border bg-white p-2.5 shadow-sm transition-shadow hover:shadow-md"
                                  style={{
                                    borderColor: selectedJob?.id === job.id ? config.color : config.borderLight,
                                    borderWidth: selectedJob?.id === job.id ? "2px" : "1px",
                                    boxShadow: snapshot.isDragging ? "0 8px 25px rgba(0,0,0,0.15)" : undefined,
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  <p className="text-sm font-medium text-slate-900">{job.customer_name}</p>
                                  <p className="mt-0.5 text-[11px] text-slate-500 truncate">{job.address}, {job.city}</p>
                                  <div className="mt-1.5 flex items-center justify-between">
                                    {job.job_value ? (
                                      <span className="text-xs font-bold" style={{ color: config.color }}>
                                        ${Number(job.job_value).toLocaleString()}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-300">No value</span>
                                    )}
                                    {job.assigned_rep && (
                                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                        {job.assigned_rep}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>

        {/* Detail Panel — slides in from the right */}
        {(selectedJob || showNewForm) && (
          <div className="w-96 shrink-0 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            {/* New Job Form */}
            {showNewForm && (
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">New Job</h2>
                  <button onClick={() => setShowNewForm(false)} className="text-slate-400 hover:text-slate-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <form onSubmit={handleCreateJob} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Customer Name *</label>
                    <input name="customer_name" required className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="John Smith" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-600">Phone</label>
                      <input name="customer_phone" type="tel" className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-600">Email</label>
                      <input name="customer_email" type="email" className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Address *</label>
                    <input name="address" required className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="123 Main St" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-600">City *</label>
                      <input name="city" required className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="w-16">
                      <label className="block text-xs font-medium text-slate-600">State</label>
                      <input name="state" defaultValue="TX" className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="w-20">
                      <label className="block text-xs font-medium text-slate-600">ZIP</label>
                      <input name="zip" className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-600">Job Value ($)</label>
                      <input name="job_value" type="number" step="0.01" min="0" className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="15000" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-600">Assigned Rep</label>
                      <input name="assigned_rep" className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600">Notes</label>
                    <textarea name="notes" rows={2} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                  <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Create Job</button>
                </form>
              </div>
            )}

            {/* Selected Job Detail */}
            {selectedJob && !showNewForm && (
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">{selectedJob.customer_name}</h2>
                  <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-slate-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Current stage badge + Estimate link */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: JOB_STAGES[selectedJob.stage]?.color }}>
                    {JOB_STAGES[selectedJob.stage]?.label}
                  </span>
                  <a
                    href={`/dashboard/sales/${selectedJob.id}/estimate`}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Estimate
                  </a>
                </div>

                {/* Stage selector */}
                <div className="mb-4">
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">Move to Stage</label>
                  <select
                    value={selectedJob.stage}
                    onChange={async (e) => {
                      const newStage = e.target.value as JobStage;
                      setSelectedJob({ ...selectedJob, stage: newStage });
                      setJobs((prev) => prev.map((j) => j.id === selectedJob.id ? { ...j, stage: newStage } : j));
                      await fetch("/api/jobs", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: selectedJob.id, stage: newStage }),
                      });
                    }}
                    className="block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {STAGE_ORDER.map((s) => (
                      <option key={s} value={s}>{JOB_STAGES[s].label}</option>
                    ))}
                  </select>
                </div>

                {isEditing ? (
                  /* Edit form */
                  <form onSubmit={handleUpdateJob} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600">Customer Name *</label>
                      <input name="customer_name" required defaultValue={selectedJob.customer_name} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-600">Phone</label>
                        <input name="customer_phone" type="tel" defaultValue={selectedJob.customer_phone || ""} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-600">Email</label>
                        <input name="customer_email" type="email" defaultValue={selectedJob.customer_email || ""} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600">Address *</label>
                      <input name="address" required defaultValue={selectedJob.address} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-600">City *</label>
                        <input name="city" required defaultValue={selectedJob.city} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                      </div>
                      <div className="w-16">
                        <label className="block text-xs font-medium text-slate-600">State</label>
                        <input name="state" defaultValue={selectedJob.state} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                      </div>
                      <div className="w-20">
                        <label className="block text-xs font-medium text-slate-600">ZIP</label>
                        <input name="zip" defaultValue={selectedJob.zip || ""} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-600">Job Value ($)</label>
                        <input name="job_value" type="number" step="0.01" min="0" defaultValue={selectedJob.job_value || ""} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-600">Assigned Rep</label>
                        <input name="assigned_rep" defaultValue={selectedJob.assigned_rep || ""} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600">Notes</label>
                      <textarea name="notes" rows={3} defaultValue={selectedJob.notes || ""} className="mt-0.5 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Save</button>
                      <button type="button" onClick={() => setIsEditing(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                    </div>
                  </form>
                ) : (
                  /* View details */
                  <div>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-xs font-medium text-slate-400">Address</dt>
                        <dd className="text-sm text-slate-900">{selectedJob.address}<br />{selectedJob.city}, {selectedJob.state} {selectedJob.zip}</dd>
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <dt className="text-xs font-medium text-slate-400">Phone</dt>
                          <dd className="text-sm text-slate-900">{selectedJob.customer_phone || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-slate-400">Email</dt>
                          <dd className="text-sm text-slate-900">{selectedJob.customer_email || "—"}</dd>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <dt className="text-xs font-medium text-slate-400">Job Value</dt>
                          <dd className="text-sm font-semibold text-slate-900">{selectedJob.job_value ? `$${Number(selectedJob.job_value).toLocaleString()}` : "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-slate-400">Assigned Rep</dt>
                          <dd className="text-sm text-slate-900">{selectedJob.assigned_rep || "—"}</dd>
                        </div>
                      </div>
                      {selectedJob.notes && (
                        <div>
                          <dt className="text-xs font-medium text-slate-400">Notes</dt>
                          <dd className="whitespace-pre-wrap text-sm text-slate-900">{selectedJob.notes}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-xs font-medium text-slate-400">Created</dt>
                        <dd className="text-sm text-slate-900">{new Date(selectedJob.created_at).toLocaleDateString()}</dd>
                      </div>
                      {selectedJob.lead_id && (
                        <div>
                          <dt className="text-xs font-medium text-slate-400">Source</dt>
                          <dd><a href={`/dashboard/canvassing/${selectedJob.lead_id}`} className="text-sm text-blue-600 hover:text-blue-800">View original lead &rarr;</a></dd>
                        </div>
                      )}
                    </dl>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit Job
                      </button>
                      {selectedJob.contact_id && (
                        <a
                          href={`/dashboard/contacts/${selectedJob.contact_id}`}
                          className="flex-1 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-center text-sm font-medium text-blue-700 hover:bg-blue-100"
                        >
                          View Profile
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
