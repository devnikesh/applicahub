import { useState } from "react";
import { useApplicants, useUpdateStage, useDeleteApplicant } from "@/hooks/use-applicants";
import { useStageCounts } from "@/hooks/use-applicants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, ChevronRight, Eye, ChevronLeft, Trash2, GitBranch, ArrowRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STAGE_COLOR_MAP, PIPELINE_STAGES, type PipelineStage } from "@/types/applicant";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ApplicantFormSheet } from "@/components/ApplicantFormSheet";

// Stage icons/emoji for visual richness
const STAGE_ICONS: Record<PipelineStage, string> = {
  "Inquiry": "💬",
  "Document Collection": "📋",
  "Application Submitted": "📤",
  "Offer Received": "🎓",
  "Visa Applied": "🛂",
  "Visa Granted": "✅",
  "Enrolled": "🏫",
  "Rejected": "❌",
};

export default function Pipeline() {
  const [selectedStage, setSelectedStage] = useState<PipelineStage>("Inquiry");
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();

  const { data: stageCounts, isLoading: countsLoading } = useStageCounts();
  const { data, isLoading } = useApplicants({ stage: selectedStage, pageSize: 100 });
  const updateStage = useUpdateStage();
  const deleteMut = useDeleteApplicant();

  const selectedCount = stageCounts?.find((s) => s.stage === selectedStage)?.count ?? 0;
  const totalApplicants = stageCounts?.reduce((acc, s) => acc + s.count, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Track applicants stage by stage · {totalApplicants} total</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setFormOpen(true)} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Add Applicant
        </Button>
      </div>

      {/* Stage summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {countsLoading
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          : PIPELINE_STAGES.map((stage) => {
              const count = stageCounts?.find((s) => s.stage === stage)?.count ?? 0;
              const isSelected = selectedStage === stage;
              return (
                <motion.button
                  key={stage}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedStage(stage)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all text-center cursor-pointer ${
                    isSelected ? `${STAGE_COLOR_MAP[stage]} border-transparent shadow-lg` : "bg-card border-border hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  <span className="text-lg leading-none">{STAGE_ICONS[stage]}</span>
                  <span className={`text-lg font-bold mt-1 ${isSelected ? "text-white" : ""}`}>{count}</span>
                  <span className={`text-[10px] leading-tight mt-0.5 ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>{stage}</span>
                  {isSelected && <motion.div layoutId="stage-indicator" className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white rounded-full" />}
                </motion.button>
              );
            })}
      </div>

      {/* Stage stepper nav (linear) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {PIPELINE_STAGES.filter((s) => s !== "Rejected").map((stage, i) => {
          const idx = PIPELINE_STAGES.indexOf(stage);
          const selIdx = PIPELINE_STAGES.indexOf(selectedStage);
          const isPast = idx < selIdx;
          const isCurrent = stage === selectedStage;
          return (
            <div key={stage} className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setSelectedStage(stage)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  isCurrent ? `${STAGE_COLOR_MAP[stage]} text-white shadow-sm` : isPast ? "bg-primary/15 text-primary hover:bg-primary/25" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {isPast && <span className="h-3 w-3 rounded-full bg-primary/40 flex items-center justify-center text-[8px] text-white">✓</span>}
                {stage}
              </button>
              {i < PIPELINE_STAGES.filter((s) => s !== "Rejected").length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />}
            </div>
          );
        })}
        {/* Rejected stage separately */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <div className="w-px h-4 bg-border" />
          <button
            onClick={() => setSelectedStage("Rejected")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              selectedStage === "Rejected" ? `${STAGE_COLOR_MAP["Rejected"]} text-white shadow-sm` : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            ❌ Rejected
          </button>
        </div>
      </div>

      {/* Stage header info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{STAGE_ICONS[selectedStage]}</span>
          <div>
            <h2 className="text-xl font-semibold">{selectedStage}</h2>
            <p className="text-sm text-muted-foreground">
              {selectedCount} applicant{selectedCount !== 1 ? "s" : ""} at this stage
            </p>
          </div>
          <Badge className={`${STAGE_COLOR_MAP[selectedStage]} border-0 ml-1`}>{selectedCount}</Badge>
        </div>
        {/* Navigation arrows */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            disabled={selectedStage === PIPELINE_STAGES[0]}
            onClick={() => {
              const idx = PIPELINE_STAGES.indexOf(selectedStage);
              if (idx > 0) setSelectedStage(PIPELINE_STAGES[idx - 1]);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            disabled={selectedStage === PIPELINE_STAGES[PIPELINE_STAGES.length - 1]}
            onClick={() => {
              const idx = PIPELINE_STAGES.indexOf(selectedStage);
              if (idx < PIPELINE_STAGES.length - 1) setSelectedStage(PIPELINE_STAGES[idx + 1]);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Applicant Cards Grid */}
      <AnimatePresence mode="wait">
        <motion.div key={selectedStage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="font-semibold text-lg text-foreground">No applicants at this stage</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Add an applicant or move someone into the <strong>{selectedStage}</strong> stage to see them here.
              </p>
              <Button variant="outline" className="mt-4 rounded-xl gap-2" onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" /> Add Applicant
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data?.data.map((applicant, i) => {
                const initials = applicant.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("");
                const selIdx = PIPELINE_STAGES.indexOf(selectedStage);
                const appNextStage = selIdx < PIPELINE_STAGES.length - 1 ? PIPELINE_STAGES[selIdx + 1] : null;
                const isLastStage = selectedStage === "Enrolled" || selectedStage === "Rejected";

                return (
                  <motion.div key={applicant.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04, duration: 0.2 }} layout>
                    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all group border hover:border-primary/20">
                      <CardContent className="p-4 flex flex-col gap-3">
                        {/* Top row: avatar + name */}
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className={`${STAGE_COLOR_MAP[applicant.stage]} text-white text-sm font-bold`}>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm leading-tight truncate">{applicant.fullName}</p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {applicant.nationality} → {applicant.countryApplyingTo}
                            </p>
                          </div>
                        </div>

                        {/* Course & University */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground truncate">🎓 {applicant.course}</p>
                          <p className="text-xs text-muted-foreground truncate">🏛️ {applicant.university}</p>
                        </div>

                        {/* Date */}
                        <p className="text-[10px] text-muted-foreground/70">Added {format(new Date(applicant.dateAdded), "MMM d, yyyy")}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 pt-1 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 flex-1 rounded-lg text-xs gap-1 text-muted-foreground hover:text-foreground"
                            onClick={() => navigate(`/applicants/${applicant.id}`)}
                          >
                            <Eye className="h-3 w-3" /> View
                          </Button>

                          {!isLastStage && appNextStage && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="secondary" size="sm" className="h-7 flex-1 rounded-lg text-xs gap-1 font-medium">
                                  <ArrowRight className="h-3 w-3" />
                                  Advance
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Advance to {appNextStage}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will move <strong>{applicant.fullName}</strong> from &ldquo;{selectedStage}&rdquo; to &ldquo;{appNextStage}&rdquo;.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => updateStage.mutate({ id: applicant.id, stage: appNextStage as PipelineStage })}>Confirm</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete applicant?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove <strong>{applicant.fullName}</strong> from the system.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteMut.mutate(applicant.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Move to Rejected option for non-rejected stages */}
      {selectedStage !== "Rejected" && selectedStage !== "Enrolled" && data && data.data.length > 0 && (
        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground text-center">
            To mark an applicant as rejected, open their profile and change the stage directly.{" "}
            <button className="text-primary underline underline-offset-2" onClick={() => navigate("/applicants")}>
              Go to Applicants
            </button>
          </p>
        </div>
      )}

      <ApplicantFormSheet open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
