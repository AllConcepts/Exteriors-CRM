// Pipeline stages for the Sales CRM Kanban board
// Each stage has a unique color so columns are easy to tell apart

export const JOB_STAGES = {
  new_lead: {
    label: "New Lead",
    color: "#3B82F6",         // blue
    bgLight: "#EFF6FF",
    borderLight: "#BFDBFE",
  },
  appointment_scheduled: {
    label: "Appointment Scheduled",
    color: "#8B5CF6",         // violet
    bgLight: "#F5F3FF",
    borderLight: "#C4B5FD",
  },
  estimating: {
    label: "Estimating",
    color: "#06B6D4",         // cyan
    bgLight: "#ECFEFF",
    borderLight: "#A5F3FC",
  },
  estimate_sent: {
    label: "Estimate Sent",
    color: "#F59E0B",         // amber
    bgLight: "#FFFBEB",
    borderLight: "#FDE68A",
  },
  signed_contract: {
    label: "Signed Contract",
    color: "#10B981",         // emerald
    bgLight: "#ECFDF5",
    borderLight: "#A7F3D0",
  },
  job_prep: {
    label: "Job Prep",
    color: "#F97316",         // orange
    bgLight: "#FFF7ED",
    borderLight: "#FED7AA",
  },
  materials_order: {
    label: "Materials Order",
    color: "#EC4899",         // pink
    bgLight: "#FDF2F8",
    borderLight: "#FBCFE8",
  },
  work_order: {
    label: "Work Order",
    color: "#6366F1",         // indigo
    bgLight: "#EEF2FF",
    borderLight: "#C7D2FE",
  },
  job_in_progress: {
    label: "Job in Progress",
    color: "#14B8A6",         // teal
    bgLight: "#F0FDFA",
    borderLight: "#99F6E4",
  },
  job_complete: {
    label: "Job Complete",
    color: "#84CC16",         // lime
    bgLight: "#F7FEE7",
    borderLight: "#BEF264",
  },
  pending_payment: {
    label: "Pending Payment",
    color: "#EAB308",         // yellow
    bgLight: "#FEFCE8",
    borderLight: "#FDE047",
  },
  paid_and_closed: {
    label: "Paid and Closed",
    color: "#22C55E",         // green
    bgLight: "#F0FDF4",
    borderLight: "#86EFAC",
  },
} as const;

export type JobStage = keyof typeof JOB_STAGES;

// Ordered list of all stages (the order columns appear on the board)
export const STAGE_ORDER: JobStage[] = [
  "new_lead",
  "appointment_scheduled",
  "estimating",
  "estimate_sent",
  "signed_contract",
  "job_prep",
  "materials_order",
  "work_order",
  "job_in_progress",
  "job_complete",
  "pending_payment",
  "paid_and_closed",
];
