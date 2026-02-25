import { useState, useRef } from "react";
import { useApplicants, useDeleteApplicant, useUpdateStage } from "@/hooks/use-applicants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
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
import { Plus, Search, LayoutGrid, List, GitBranch, Trash2, Edit, Eye, ChevronLeft, ChevronRight, Users, GripVertical, Globe, BookOpen, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STAGE_COLOR_MAP, PIPELINE_STAGES, type PipelineStage } from "@/types/applicant";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ApplicantFormSheet } from "@/components/ApplicantFormSheet";

type ViewMode = "table" | "kanban" | "pipeline";

export default function Applicants() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<ViewMode>("table");
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const navigate = useNavigate();
  const deleteMut = useDeleteApplicant();

  const { data, isLoading } = useApplicants({
    search: search || undefined,
    stage: stageFilter !== "all" ? (stageFilter as PipelineStage) : undefined,
    page,
    pageSize: view === "table" ? 10 : 100,
  });

  const allApplicants = useApplicants({ pageSize: 100 });
  const updateStage = useUpdateStage();
  const totalPages = Math.ceil((data?.total || 0) / 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Applicants</h1>
          <Badge variant="secondary" className="text-sm">
            {data?.total || 0}
          </Badge>
        </div>
        <Button
          onClick={() => {
            setEditId(undefined);
            setFormOpen(true);
          }}
          className="rounded-xl gap-2"
        >
          <Plus className="h-4 w-4" /> Add Applicant
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={stageFilter}
          onValueChange={(v) => {
            setStageFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {PIPELINE_STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 border rounded-lg p-1">
          {(
            [
              ["table", List],
              ["kanban", LayoutGrid],
              ["pipeline", GitBranch],
            ] as const
          ).map(([v, Icon]) => (
            <Button key={v} variant={view === v ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setView(v as ViewMode)}>
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* Views */}
      <AnimatePresence mode="wait">
        {/* ── TABLE VIEW with Feature 6: HoverCard quick-peek ── */}
        {view === "table" && (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : data?.data.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No applicants found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden lg:table-cell">Country</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead className="hidden sm:table-cell">Date Added</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.data.map((a, i) => (
                        <motion.tr
                          key={a.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                          onClick={() => navigate(`/applicants/${a.id}`)}
                        >
                          {/* Feature 6: HoverCard on name cell */}
                          <TableCell className="font-medium">
                            <HoverCard openDelay={400} closeDelay={100}>
                              <HoverCardTrigger asChild>
                                <span className="cursor-pointer hover:text-primary transition-colors">{a.fullName}</span>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-72" side="right" align="start">
                                <div className="flex gap-3">
                                  <Avatar className="h-12 w-12 flex-shrink-0">
                                    <AvatarFallback className={`${STAGE_COLOR_MAP[a.stage]} text-white font-bold`}>
                                      {a.fullName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0 space-y-1.5">
                                    <p className="font-semibold text-sm">{a.fullName}</p>
                                    <Badge className={`${STAGE_COLOR_MAP[a.stage]} border-0 text-[10px]`}>{a.stage}</Badge>
                                    <div className="space-y-1 pt-1">
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Globe className="h-3 w-3" />
                                        <span>
                                          {a.nationality} → {a.countryApplyingTo}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <BookOpen className="h-3 w-3" />
                                        <span className="truncate">{a.course}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Building2 className="h-3 w-3" />
                                        <span className="truncate">{a.university}</span>
                                      </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground/60 pt-1">Added {format(new Date(a.dateAdded), "MMM d, yyyy")}</p>
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{a.email}</TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">{a.countryApplyingTo}</TableCell>
                          <TableCell>
                            <Badge className={`${STAGE_COLOR_MAP[a.stage]} text-[10px] border-0`}>{a.stage}</Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{format(new Date(a.dateAdded), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/applicants/${a.id}`)}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditId(a.id);
                                  setFormOpen(true);
                                }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete applicant?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently remove {a.fullName} from the system.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteMut.mutate(a.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── KANBAN VIEW with Feature 3: Drag-and-Drop ── */}
        {view === "kanban" && (
          <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <KanbanBoard
              applicants={allApplicants.data?.data || []}
              isLoading={allApplicants.isLoading}
              onStageChange={(id, stage) => updateStage.mutate({ id, stage })}
              onNavigate={(id) => navigate(`/applicants/${id}`)}
            />
          </motion.div>
        )}

        {/* ── PIPELINE VIEW (existing linear view) ── */}
        {view === "pipeline" && <PipelineView />}
      </AnimatePresence>

      <ApplicantFormSheet open={formOpen} onOpenChange={setFormOpen} applicantId={editId} />
    </div>
  );
}

// ─────────────────────────────────────────────
//  Feature 3: Kanban with HTML5 Drag-and-Drop
// ─────────────────────────────────────────────
interface KanbanBoardProps {
  applicants: import("@/types/applicant").Applicant[];
  isLoading: boolean;
  onStageChange: (id: string, stage: PipelineStage) => void;
  onNavigate: (id: string) => void;
}

function KanbanBoard({ applicants, isLoading, onStageChange, onNavigate }: KanbanBoardProps) {
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const dragId = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
    // Ghost image offset
    const el = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, 20);
  };

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stage);
  };

  const handleDrop = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    if (dragId.current) {
      const app = applicants.find((a) => a.id === dragId.current);
      if (app && app.stage !== stage) {
        onStageChange(dragId.current, stage);
      }
    }
    dragId.current = null;
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    dragId.current = null;
    setDragOverStage(null);
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((s) => (
          <Skeleton key={s} className="min-w-[260px] h-64 rounded-2xl flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((stage) => {
        const stageApps = applicants.filter((a) => a.stage === stage);
        const isOver = dragOverStage === stage;

        return (
          <div
            key={stage}
            className="min-w-[260px] flex-shrink-0 flex flex-col"
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={(e) => handleDrop(e, stage)}
          >
            {/* Column header */}
            <div className={`flex items-center gap-2 mb-3 px-1`}>
              <div className={`h-2.5 w-2.5 rounded-full ${STAGE_COLOR_MAP[stage]}`} />
              <h3 className="text-sm font-semibold flex-1 truncate">{stage}</h3>
              <Badge variant="secondary" className="text-xs">
                {stageApps.length}
              </Badge>
            </div>

            {/* Drop zone */}
            <div
              className={`flex-1 rounded-xl p-2 space-y-2 min-h-[160px] transition-all duration-150 ${
                isOver ? "bg-primary/10 border-2 border-primary/40 border-dashed" : "bg-muted/30 border-2 border-transparent"
              }`}
            >
              {stageApps.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, a.id)}
                  onDragEnd={handleDragEnd}
                  className="group"
                >
                  <Card className="rounded-xl shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:border-primary/20 active:scale-95" onClick={() => onNavigate(a.id)}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 mt-0.5 flex-shrink-0 group-hover:text-muted-foreground/70 transition-colors" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-tight truncate">{a.fullName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {a.nationality} → {a.countryApplyingTo}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1.5">{format(new Date(a.lastUpdated), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {stageApps.length === 0 && (
                <div className={`p-6 text-center text-xs transition-colors ${isOver ? "text-primary font-medium" : "text-muted-foreground"} border border-dashed rounded-xl`}>
                  {isOver ? "Drop here" : "No applicants"}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Pipeline linear view (embedded, unchanged)
// ─────────────────────────────────────────────
function PipelineView() {
  const [selectedStage, setSelectedStage] = useState<PipelineStage>("Inquiry");
  const { data, isLoading } = useApplicants({ stage: selectedStage, pageSize: 100 });
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <div className="flex gap-1 overflow-x-auto pb-2">
        {PIPELINE_STAGES.map((stage) => (
          <Button key={stage} variant={selectedStage === stage ? "default" : "outline"} size="sm" className="rounded-full whitespace-nowrap text-xs" onClick={() => setSelectedStage(stage)}>
            {stage}
          </Button>
        ))}
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p className="text-sm">No applicants at this stage</p>
            </div>
          ) : (
            <div className="divide-y">
              {data?.data.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium">{a.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {a.nationality} → {a.countryApplyingTo}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground hidden sm:block">{format(new Date(a.dateAdded), "MMM d, yyyy")}</span>
                    <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate(`/applicants/${a.id}`)}>
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
