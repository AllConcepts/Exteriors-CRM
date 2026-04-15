// Central config for all lead statuses — used by map pins, lists, and detail pages

export const LEAD_STATUSES = {
  new: {
    label: "New",
    color: "#3B82F6",       // blue
    symbol: "N",
  },
  interested: {
    label: "Interested",
    color: "#22C55E",       // green
    symbol: "I",
  },
  not_home: {
    label: "Not Home",
    color: "#EAB308",       // yellow
    symbol: "NH",
  },
  not_interested: {
    label: "Not Interested",
    color: "#EF4444",       // red
    symbol: "NI",
  },
  ho_nh_come_back: {
    label: "H.O. NH Come Back",
    color: "#F97316",       // orange
    symbol: "CB",
  },
  renter: {
    label: "Renter",
    color: "#A855F7",       // purple
    symbol: "R",
  },
  no_soliciting: {
    label: "No Soliciting",
    color: "#6B7280",       // gray
    symbol: "NS",
  },
  call_back: {
    label: "Call Back",
    color: "#06B6D4",       // cyan
    symbol: "CL",
  },
  go_back: {
    label: "Go Back",
    color: "#0EA5E9",       // sky blue
    symbol: "GB",
  },
  go_back_tonight: {
    label: "Go Back Tonight",
    color: "#6366F1",       // indigo
    symbol: "GT",
  },
  inspection: {
    label: "Inspection",
    color: "#14B8A6",       // teal
    symbol: "IN",
  },
  existing_customer: {
    label: "Existing Customer",
    color: "#D97706",       // amber
    symbol: "EC",
  },
  do_not_knock: {
    label: "Do Not Knock",
    color: "#1F2937",       // dark / black
    symbol: "X",
  },
  sold: {
    label: "Sold",
    color: "#059669",       // emerald
    symbol: "S",
  },
} as const;

export type LeadStatus = keyof typeof LEAD_STATUSES;

// Tailwind badge classes for list/detail views
export const STATUS_BADGE_CLASSES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  interested: "bg-green-100 text-green-700",
  not_home: "bg-yellow-100 text-yellow-700",
  not_interested: "bg-red-100 text-red-700",
  ho_nh_come_back: "bg-orange-100 text-orange-700",
  renter: "bg-purple-100 text-purple-700",
  no_soliciting: "bg-slate-200 text-slate-700",
  call_back: "bg-cyan-100 text-cyan-700",
  go_back: "bg-sky-100 text-sky-700",
  go_back_tonight: "bg-indigo-100 text-indigo-700",
  inspection: "bg-teal-100 text-teal-700",
  existing_customer: "bg-amber-100 text-amber-700",
  do_not_knock: "bg-slate-800 text-white",
  sold: "bg-emerald-100 text-emerald-700",
};
