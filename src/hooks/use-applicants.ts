import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicantsApi, dashboardApi } from "@/services/mock-api";
import type { PipelineStage, Applicant } from "@/types/applicant";
import { useToast } from "@/hooks/use-toast";

export function useDashboardStats() {
  return useQuery({ queryKey: ["dashboard", "stats"], queryFn: dashboardApi.getStats });
}

export function useRecentApplicants() {
  return useQuery({ queryKey: ["dashboard", "recent"], queryFn: dashboardApi.getRecent });
}

export function useStageCounts() {
  return useQuery({ queryKey: ["dashboard", "stageCounts"], queryFn: dashboardApi.getStageCounts });
}

export function useApplicants(params?: { search?: string; stage?: PipelineStage; country?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ["applicants", params],
    queryFn: () => applicantsApi.list(params),
  });
}

export function useApplicant(id: string) {
  return useQuery({
    queryKey: ["applicant", id],
    queryFn: () => applicantsApi.getById(id),
    enabled: !!id,
  });
}

export function useApplicantTimeline(id: string) {
  return useQuery({ queryKey: ["applicant", id, "timeline"], queryFn: () => applicantsApi.getTimeline(id), enabled: !!id });
}

export function useApplicantDocuments(id: string) {
  return useQuery({ queryKey: ["applicant", id, "documents"], queryFn: () => applicantsApi.getDocuments(id), enabled: !!id });
}

export function useApplicantPayments(id: string) {
  return useQuery({ queryKey: ["applicant", id, "payments"], queryFn: () => applicantsApi.getPayments(id), enabled: !!id });
}

export function useCreateApplicant() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Omit<Applicant, "id" | "dateAdded" | "lastUpdated">) => applicantsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applicants"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Applicant created", description: "New applicant has been added successfully." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateApplicant() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Applicant> }) => applicantsApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["applicants"] });
      qc.invalidateQueries({ queryKey: ["applicant", id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Applicant updated", description: "Changes saved successfully." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteApplicant() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: string) => applicantsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["applicants"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Applicant deleted", description: "Applicant has been removed." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateStage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: PipelineStage }) => applicantsApi.updateStage(id, stage),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["applicants"] });
      qc.invalidateQueries({ queryKey: ["applicant", id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Stage updated", description: "Applicant stage has been changed." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
}
