import { mockApplicants, mockUser, generateTimeline, generateDocuments, generatePayments } from "@/data/mock-data";
import type { Applicant, DashboardStats, StageCount, PipelineStage, TimelineEntry, Document, Payment, User } from "@/types/applicant";
import { PIPELINE_STAGES } from "@/types/applicant";

// Simulated delay
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

let applicants = [...mockApplicants];

// Auth
let isAuthenticated = false;

export const authApi = {
  login: async (email: string, password: string): Promise<User> => {
    await delay(800);
    if (email === "sarah@applicahub.com" && password === "password123") {
      isAuthenticated = true;
      return mockUser;
    }
    throw new Error("Invalid email or password. Try sarah@applicahub.com / password123");
  },
  logout: async () => { await delay(200); isAuthenticated = false; },
  me: async (): Promise<User> => {
    await delay(200);
    if (!isAuthenticated) throw new Error("Not authenticated");
    return mockUser;
  },
  isLoggedIn: () => isAuthenticated,
  setLoggedIn: (v: boolean) => { isAuthenticated = v; },
};

// Dashboard
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    await delay();
    const inProgressStages: PipelineStage[] = ["Document Collection", "Application Submitted", "Visa Applied"];
    return {
      totalApplicants: applicants.length,
      inProgress: applicants.filter(a => inProgressStages.includes(a.stage)).length,
      approved: applicants.filter(a => a.stage === "Visa Granted" || a.stage === "Enrolled").length,
      pendingAction: applicants.filter(a => a.stage === "Inquiry" || a.stage === "Offer Received").length,
    };
  },
  getRecent: async (): Promise<Applicant[]> => {
    await delay();
    return [...applicants].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).slice(0, 10);
  },
  getStageCounts: async (): Promise<StageCount[]> => {
    await delay();
    return PIPELINE_STAGES.map(stage => ({
      stage,
      count: applicants.filter(a => a.stage === stage).length,
    }));
  },
};

// Applicants
export const applicantsApi = {
  list: async (params?: { search?: string; stage?: PipelineStage; country?: string; page?: number; pageSize?: number }): Promise<{ data: Applicant[]; total: number }> => {
    await delay();
    let filtered = [...applicants];
    if (params?.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(a => a.fullName.toLowerCase().includes(s) || a.email.toLowerCase().includes(s) || a.phone.includes(s));
    }
    if (params?.stage) filtered = filtered.filter(a => a.stage === params.stage);
    if (params?.country) filtered = filtered.filter(a => a.countryApplyingTo === params.country);
    const total = filtered.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    return { data: filtered.slice(start, start + pageSize), total };
  },
  getById: async (id: string): Promise<Applicant> => {
    await delay();
    const a = applicants.find(x => x.id === id);
    if (!a) throw new Error("Applicant not found");
    return a;
  },
  create: async (data: Omit<Applicant, "id" | "dateAdded" | "lastUpdated">): Promise<Applicant> => {
    await delay(600);
    const newApp: Applicant = {
      ...data,
      id: `app-${String(applicants.length + 1).padStart(3, "0")}`,
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    applicants = [newApp, ...applicants];
    return newApp;
  },
  update: async (id: string, data: Partial<Applicant>): Promise<Applicant> => {
    await delay(600);
    const idx = applicants.findIndex(x => x.id === id);
    if (idx === -1) throw new Error("Applicant not found");
    applicants[idx] = { ...applicants[idx], ...data, lastUpdated: new Date().toISOString() };
    return applicants[idx];
  },
  delete: async (id: string): Promise<void> => {
    await delay(400);
    applicants = applicants.filter(x => x.id !== id);
  },
  updateStage: async (id: string, stage: PipelineStage): Promise<Applicant> => {
    return applicantsApi.update(id, { stage });
  },
  getTimeline: async (id: string): Promise<TimelineEntry[]> => { await delay(); return generateTimeline(id); },
  getDocuments: async (id: string): Promise<Document[]> => { await delay(); return generateDocuments(id); },
  getPayments: async (id: string): Promise<Payment[]> => { await delay(); return generatePayments(id); },
};
