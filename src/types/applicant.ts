export const PIPELINE_STAGES = [
  "Inquiry",
  "Document Collection",
  "Application Submitted",
  "Offer Received",
  "Visa Applied",
  "Visa Granted",
  "Enrolled",
  "Rejected",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export interface Applicant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  countryApplyingTo: string;
  university: string;
  course: string;
  stage: PipelineStage;
  notes: string;
  dateAdded: string;
  lastUpdated: string;
  avatar?: string;
}

export interface TimelineEntry {
  id: string;
  applicantId: string;
  action: string;
  fromStage?: PipelineStage;
  toStage?: PipelineStage;
  note?: string;
  createdAt: string;
  createdBy: string;
}

export interface Document {
  id: string;
  applicantId: string;
  name: string;
  type: "Passport" | "Photo" | "Transcripts" | "Offer Letter" | "Visa";
  status: "Pending" | "Uploaded" | "Verified";
  uploadedAt?: string;
}

export interface Payment {
  id: string;
  applicantId: string;
  date: string;
  amount: number;
  type: string;
  status: "Paid" | "Pending" | "Overdue";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface DashboardStats {
  totalApplicants: number;
  inProgress: number;
  approved: number;
  pendingAction: number;
}

export interface StageCount {
  stage: PipelineStage;
  count: number;
}

export const STAGE_COLOR_MAP: Record<PipelineStage, string> = {
  "Inquiry": "bg-stage-inquiry text-white",
  "Document Collection": "bg-stage-documents text-white",
  "Application Submitted": "bg-stage-submitted text-white",
  "Offer Received": "bg-stage-offer text-white",
  "Visa Applied": "bg-stage-visa-applied text-white",
  "Visa Granted": "bg-stage-visa-granted text-white",
  "Enrolled": "bg-stage-enrolled text-white",
  "Rejected": "bg-stage-rejected text-white",
};
