export type EnquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "VISIT_SCHEDULED"
  | "CLOSED"
  | "NOT_INTERESTED";

export const STATUS_LABEL: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  VISIT_SCHEDULED: "Visit scheduled",
  CLOSED: "Closed",
  NOT_INTERESTED: "Not interested",
};

// Button text for moving an enquiry INTO a status.
export const ACTION_LABEL: Record<EnquiryStatus, string> = {
  NEW: "",
  CONTACTED: "Accept & mark contacted",
  VISIT_SCHEDULED: "Visit scheduled",
  CLOSED: "Close",
  NOT_INTERESTED: "Not interested",
};

// Which statuses an owner may move to from each status. CLOSED and NOT_INTERESTED are final.
export const NEXT_STATUSES: Record<EnquiryStatus, EnquiryStatus[]> = {
  NEW: ["CONTACTED", "NOT_INTERESTED"],
  CONTACTED: ["VISIT_SCHEDULED", "CLOSED", "NOT_INTERESTED"],
  VISIT_SCHEDULED: ["CLOSED", "NOT_INTERESTED"],
  CLOSED: [],
  NOT_INTERESTED: [],
};

export function canTransition(from: EnquiryStatus, to: EnquiryStatus) {
  return NEXT_STATUSES[from].includes(to);
}

// "ON_ACCEPT": buyer sees owner contact only after the owner responds (anti-scraping).
// "ON_ENQUIRY": buyer sees it as soon as they have sent an enquiry.
const REVEAL_POLICY: "ON_ACCEPT" | "ON_ENQUIRY" = "ON_ACCEPT";

const REVEAL_STATUSES: Record<typeof REVEAL_POLICY, EnquiryStatus[]> = {
  ON_ACCEPT: ["CONTACTED", "VISIT_SCHEDULED", "CLOSED"],
  ON_ENQUIRY: ["NEW", "CONTACTED", "VISIT_SCHEDULED", "CLOSED"],
};

export function canRevealContact(status: EnquiryStatus) {
  return REVEAL_STATUSES[REVEAL_POLICY].includes(status);
}