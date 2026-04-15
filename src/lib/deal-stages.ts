// Pipeline stages for the Sales CRM

export const DEAL_STAGES = {
  new_lead: {
    label: "New Lead",
    color: "#3B82F6",
    bgClass: "bg-blue-50 border-blue-200",
    headerClass: "bg-blue-500",
  },
  contact_made: {
    label: "Contact Made",
    color: "#F59E0B",
    bgClass: "bg-amber-50 border-amber-200",
    headerClass: "bg-amber-500",
  },
  appointment_set: {
    label: "Appointment Set",
    color: "#8B5CF6",
    bgClass: "bg-violet-50 border-violet-200",
    headerClass: "bg-violet-500",
  },
  inspection_complete: {
    label: "Inspection Complete",
    color: "#14B8A6",
    bgClass: "bg-teal-50 border-teal-200",
    headerClass: "bg-teal-500",
  },
  estimate_sent: {
    label: "Estimate Sent",
    color: "#F97316",
    bgClass: "bg-orange-50 border-orange-200",
    headerClass: "bg-orange-500",
  },
  negotiation: {
    label: "Negotiation",
    color: "#EC4899",
    bgClass: "bg-pink-50 border-pink-200",
    headerClass: "bg-pink-500",
  },
  sold: {
    label: "Sold",
    color: "#22C55E",
    bgClass: "bg-green-50 border-green-200",
    headerClass: "bg-green-500",
  },
  lost: {
    label: "Lost",
    color: "#EF4444",
    bgClass: "bg-red-50 border-red-200",
    headerClass: "bg-red-500",
  },
} as const;

export type DealStage = keyof typeof DEAL_STAGES;

// Active pipeline stages (shown as columns on the board)
export const PIPELINE_STAGES: DealStage[] = [
  "new_lead",
  "contact_made",
  "appointment_set",
  "inspection_complete",
  "estimate_sent",
  "negotiation",
];

// Closed stages (shown separately)
export const CLOSED_STAGES: DealStage[] = ["sold", "lost"];
