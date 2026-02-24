import { useState } from "react";
import { useApplicants, useDeleteApplicant, useUpdateStage } from "@/hooks/use-applicants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, LayoutGrid, List, GitBranch, Trash2, Edit, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STAGE_COLOR_MAP, PIPELINE_STAGES, type PipelineStage } from "@/types/applicant";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ApplicantFormSheet } from "@/components/ApplicantFormSheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
          <Badge variant="secondary" className="text-sm">{data?.total || 0}</Badge>
        </div>
        <Button onClick={() => { setEditId(undefined); setFormOpen(true); }} className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Add Applicant
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, phone..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={stageFilter} onValueChange={v => { setStageFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {PIPELINE_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-1 border rounded-lg p-1">
          {([["table", List], ["kanban", LayoutGrid], ["pipeline", GitBranch]] as const).map(([v, Icon]) => (
            <Button key={v} variant={view === v ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setView(v as ViewMode)}>
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>

      {/* Views */}
      <AnimatePresence mode="wait">
        {view === "table" && (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
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
                          <TableCell className="font-medium">{a.fullName}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{a.email}</TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">{a.countryApplyingTo}</TableCell>
                          <TableCell>
                            <Badge className={`${STAGE_COLOR_MAP[a.stage]} text-[10px] border-0`}>{a.stage}</Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                            {format(new Date(a.dateAdded), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/applicants/${a.id}`)}>
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditId(a.id); setFormOpen(true); }}>
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
                <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {view === "kanban" && (
          <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {PIPELINE_STAGES.map(stage => {
                const stageApps = allApplicants.data?.data.filter(a => a.stage === stage) || [];
                return (
                  <div key={stage} className="min-w-[280px] flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${STAGE_COLOR_MAP[stage]}`} />
                      <h3 className="text-sm font-semibold">{stage}</h3>
                      <Badge variant="secondary" className="text-xs">{stageApps.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {stageApps.map((a, i) => (
                        <motion.div
                          key={a.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Card
                            className="rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => navigate(`/applicants/${a.id}`)}
                          >
                            <CardContent className="p-4">
                              <p className="font-medium text-sm">{a.fullName}</p>
                              <p className="text-xs text-muted-foreground mt-1">{a.nationality} → {a.countryApplyingTo}</p>
                              <p className="text-[10px] text-muted-foreground mt-2">{format(new Date(a.lastUpdated), "MMM d, yyyy")}</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                      {stageApps.length === 0 && (
                        <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                          No applicants
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {view === "pipeline" && (
          <PipelineView />
        )}
      </AnimatePresence>

      <ApplicantFormSheet open={formOpen} onOpenChange={setFormOpen} applicantId={editId} />
    </div>
  );
}

function PipelineView() {
  const [selectedStage, setSelectedStage] = useState<PipelineStage>("Inquiry");
  const { data, isLoading } = useApplicants({ stage: selectedStage, pageSize: 100 });
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Stage stepper */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {PIPELINE_STAGES.map(stage => (
          <Button
            key={stage}
            variant={selectedStage === stage ? "default" : "outline"}
            size="sm"
            className="rounded-full whitespace-nowrap text-xs"
            onClick={() => setSelectedStage(stage)}
          >
            {stage}
          </Button>
        ))}
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p className="text-sm">No applicants at this stage</p>
            </div>
          ) : (
            <div className="divide-y">
              {data?.data.map(a => (
                <div key={a.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium">{a.fullName}</p>
                    <p className="text-sm text-muted-foreground">{a.nationality} → {a.countryApplyingTo}</p>
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

// Need to import Users icon for empty state
import { Users } from "lucide-react";
