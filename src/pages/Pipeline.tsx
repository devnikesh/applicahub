import { useState, useEffect } from "react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, ChevronRight, Eye, ChevronLeft, Trash2, GitBranch, ArrowRight, Users, MoreVertical, XCircle, CheckCircle2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { STAGE_COLOR_MAP, PIPELINE_STAGES, type PipelineStage } from "@/types/applicant";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ApplicantFormSheet } from "@/components/ApplicantFormSheet";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const paramStage = searchParams.get("stage") as PipelineStage | null;
  const [selectedStage, setSelectedStageState] = useState<PipelineStage>(paramStage && PIPELINE_STAGES.includes(paramStage) ? paramStage : "Inquiry");
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();

  // Keep URL in sync when stage changes
  const setSelectedStage = (stage: PipelineStage) => {
    setSelectedStageState(stage);
    setSearchParams({ stage });
  };

  // Respond to URL changes (e.g. from Dashboard click)
  useEffect(() => {
    if (paramStage && PIPELINE_STAGES.includes(paramStage) && paramStage !== selectedStage) {
      setSelectedStageState(paramStage);
    }
  }, [paramStage]);

  const { data: stageCounts, isLoading: countsLoading } = useStageCounts();
  const { data, isLoading } = useApplicants({ stage: selectedStage, pageSize: 100 });
  const updateStage = useUpdateStage();
  const deleteMut = useDeleteApplicant();

  const selectedCount = stageCounts?.find((s) => s.stage === selectedStage)?.count ?? 0;
  const totalApplicants = stageCounts?.reduce((acc, s) => acc + s.count, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track applicants stage by stage · {totalApplicants} total</p>
          </div>
        </div>
        <Button onClick={() => setFormOpen(true)} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Add Applicant
        </Button>
      </div>

      {/* ── Stage stat tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {countsLoading
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          : PIPELINE_STAGES.map((stage) => {
              const count = stageCounts?.find((s) => s.stage === stage)?.count ?? 0;
              const isSelected = selectedStage === stage;
              return (
                <motion.button
                  key={stage}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedStage(stage)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all text-center cursor-pointer ${
                    isSelected ? `${STAGE_COLOR_MAP[stage]} border-transparent shadow-lg` : "bg-card border-border hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  <span className="text-lg leading-none">{STAGE_ICONS[stage]}</span>
                  <span className={`text-lg font-bold mt-1 ${isSelected ? "text-white" : ""}`}>{count}</span>
                  <span className={`text-[10px] leading-tight mt-0.5 ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>{stage}</span>
                </motion.button>
              );
            })}
      </div>

      {/* ── Feature 1: Funnel Analytics Bar ── */}
      {!countsLoading && stageCounts && totalApplicants > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Distribution</p>
          <div className="flex rounded-xl overflow-hidden h-7 border gap-px bg-border">
            {stageCounts
              .filter((s) => s.count > 0)
              .map((s) => {
                const pct = (s.count / totalApplicants) * 100;
                return (
                  <Tooltip key={s.stage}>
                    <TooltipTrigger asChild>
                      <button
                        className={`${STAGE_COLOR_MAP[s.stage]} flex items-center justify-center transition-all hover:brightness-110 active:brightness-90 cursor-pointer`}
                        style={{ width: `${pct}%`, minWidth: pct > 0 ? "2px" : 0 }}
                        onClick={() => setSelectedStage(s.stage)}
                      >
                        {pct > 8 && <span className="text-[10px] font-semibold text-white drop-shadow">{s.count}</span>}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{s.stage}</p>
                      <p className="text-xs opacity-80">
                        {s.count} applicant{s.count !== 1 ? "s" : ""} · {pct.toFixed(1)}%
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {stageCounts.map((s) => (
              <button key={s.stage} onClick={() => setSelectedStage(s.stage)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <span className={`h-2 w-2 rounded-full ${STAGE_COLOR_MAP[s.stage]}`} />
                {s.stage} ({s.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Stage stepper (linear nav) ── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {PIPELINE_STAGES.filter((s) => s !== "Rejected").map((stage, i, arr) => {
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
                {isPast && <CheckCircle2 className="h-3 w-3" />}
                {stage}
              </button>
              {i < arr.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />}
            </div>
          );
        })}
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <div className="w-px h-4 bg-border" />
          <button
            onClick={() => setSelectedStage("Rejected")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              selectedStage === "Rejected" ? `${STAGE_COLOR_MAP["Rejected"]} text-white shadow-sm` : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <XCircle className="h-3 w-3" />
            Rejected
          </button>
        </div>
      </div>

      {/* ── Stage heading + arrow nav ── */}
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

      {/* ── Applicant Cards ── */}
      <AnimatePresence mode="wait">
        <motion.div key={selectedStage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="font-semibold text-lg">No applicants at this stage</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Add an applicant or move someone into <strong>{selectedStage}</strong> to see them here.
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
                const isTerminal = selectedStage === "Enrolled" || selectedStage === "Rejected";

                return (
                  <motion.div key={applicant.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04, duration: 0.2 }} layout>
                    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-all border hover:border-primary/20 group">
                      <CardContent className="p-4 flex flex-col gap-3">
                        {/* Avatar + name + 3-dot menu */}
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

                          {/* Feature 2: 3-dot DropdownMenu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => navigate(`/applicants/${applicant.id}`)}>
                                <Eye className="h-3.5 w-3.5 mr-2" /> View Profile
                              </DropdownMenuItem>
                              {!isTerminal && appNextStage && (
                                <DropdownMenuItem onClick={() => updateStage.mutate({ id: applicant.id, stage: appNextStage as PipelineStage })}>
                                  <ArrowRight className="h-3.5 w-3.5 mr-2" />
                                  Advance to {appNextStage}
                                </DropdownMenuItem>
                              )}
                              {selectedStage !== "Rejected" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => updateStage.mutate({ id: applicant.id, stage: "Rejected" })}>
                                    <XCircle className="h-3.5 w-3.5 mr-2" /> Mark as Rejected
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                                  </DropdownMenuItem>
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
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Course & University */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground truncate">🎓 {applicant.course}</p>
                          <p className="text-xs text-muted-foreground truncate">🏛️ {applicant.university}</p>
                        </div>

                        <p className="text-[10px] text-muted-foreground/60">Added {format(new Date(applicant.dateAdded), "MMM d, yyyy")}</p>

                        {/* Actions row */}
                        <div className="flex items-center gap-1.5 pt-1 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 flex-1 rounded-lg text-xs gap-1 text-muted-foreground hover:text-foreground"
                            onClick={() => navigate(`/applicants/${applicant.id}`)}
                          >
                            <Eye className="h-3 w-3" /> View
                          </Button>

                          {!isTerminal && appNextStage && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="secondary" size="sm" className="h-7 flex-1 rounded-lg text-xs gap-1 font-medium">
                                  <ArrowRight className="h-3 w-3" /> Advance
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

      <ApplicantFormSheet open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
