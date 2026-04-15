// TypeScript types for the estimating system

export interface EstimateVariation {
  id: string;
  line_item_id: string;
  name: string;
  material_cost: number;
  labor_cost: number;
  profit_margin: number;
  is_selected: boolean;
}

export interface EstimateLineItem {
  id: string;
  group_id: string;
  name: string;
  description: string | null;
  material_cost: number;
  labor_cost: number;
  profit_margin: number;
  quantity: number;
  unit: string;
  sort_order: number;
  variations?: EstimateVariation[];
}

export interface EstimateGroup {
  id: string;
  estimate_id: string;
  name: string;
  sort_order: number;
  line_items?: EstimateLineItem[];
  is_collapsed?: boolean; // UI-only state
}

export interface EstimatePhoto {
  id: string;
  estimate_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
}

export interface EstimateProduct {
  id: string;
  estimate_id: string;
  title: string;
  file_url: string;
  sort_order: number;
}

export interface EstimateCustomPage {
  id: string;
  estimate_id: string;
  title: string;
  content: string | null;
  sort_order: number;
}

export interface Estimate {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  job_id: string;
  estimate_number: string;
  customer_name: string;
  address: string;
  city: string;
  state: string;
  zip: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: "draft" | "sent" | "viewed" | "signed" | "expired";
  show_cover: boolean;
  show_photos: boolean;
  show_scope: boolean;
  show_products: boolean;
  show_terms: boolean;
  show_signature: boolean;
  terms_content: string | null;
  signature_token: string;
  signed_at: string | null;
  signed_by_name: string | null;
  signature_data: string | null;
  // Joined data
  groups?: EstimateGroup[];
  photos?: EstimatePhoto[];
  products?: EstimateProduct[];
  custom_pages?: EstimateCustomPage[];
}

// Calculate line item total price
// Margin formula: selling price = cost / (1 - margin/100)
// Example: $100 cost at 20% margin = $100 / 0.80 = $125 (profit is 20% of sell price)
export function calcLineItemTotal(item: {
  material_cost: number;
  labor_cost: number;
  profit_margin: number;
  quantity: number;
  variations?: EstimateVariation[];
}): number {
  // Check if any variation is selected
  const selectedVariation = item.variations?.find((v) => v.is_selected);

  const material = selectedVariation ? selectedVariation.material_cost : item.material_cost;
  const labor = selectedVariation ? selectedVariation.labor_cost : item.labor_cost;
  const margin = selectedVariation ? selectedVariation.profit_margin : item.profit_margin;

  const costPerUnit = material + labor;
  // Margin: profit is a % of the selling price, not the cost
  // Clamp margin to prevent division by zero (max 99.99%)
  const clampedMargin = Math.min(margin, 99.99);
  const sellingPrice = costPerUnit / (1 - clampedMargin / 100);
  return sellingPrice * item.quantity;
}

// Common units for roofing
export const UNITS = [
  "each",
  "SQ",      // roofing squares (100 sq ft)
  "LF",      // linear feet
  "SF",      // square feet
  "bundle",
  "roll",
  "piece",
  "hour",
  "day",
  "lot",
];
