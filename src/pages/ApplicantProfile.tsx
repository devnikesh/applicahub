import { useParams, useNavigate } from "react-router-dom";
import { useApplicant, useApplicantTimeline, useApplicantDocuments, useApplicantPayments, useUpdateStage } from "@/hooks/use-applicants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, ChevronRight, Upload, Plus, Mail, Phone, Globe, Calendar } from "lucide-react";
import { STAGE_COLOR_MAP, PIPELINE_STAGES, type PipelineStage } from "@/types/applicant";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";
import { ApplicantFormSheet } from "@/components/ApplicantFormSheet";

export default function ApplicantProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: applicant, isLoading } = useApplicant(id!);
  const { data: timeline } = useApplicantTimeline(id!);
  const { data: documents } = useApplicantDocuments(id!);
  const { data: payments } = useApplicantPayments(id!);
  const updateStage = useUpdateStage();
  const [editOpen, setEditOpen] = useState(false);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<{ text: string; date: string }[]>([]);

  if (isLoading) return <div className="space-y-4 p-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  if (!applicant) return <div className="p-12 text-center text-muted-foreground">Applicant not found</div>;

  const currentStageIdx = PIPELINE_STAGES.indexOf(applicant.stage);
  const nextStage = currentStageIdx < PIPELINE_STAGES.length - 2 ? PIPELINE_STAGES[currentStageIdx + 1] : null;
  const initials = applicant.fullName.split(" ").map(n => n[0]).join("");

  const addNote = () => {
    if (!note.trim()) return;
    setNotes(prev => [{ text: note, date: new Date().toISOString() }, ...prev]);
    setNote("");
  };

  const docStatusColor = (s: string) => s === "Verified" ? "bg-success text-success-foreground" : s === "Uploaded" ? "bg-info text-info-foreground" : "bg-muted text-muted-foreground";
  const payStatusColor = (s: string) => s === "Paid" ? "text-success" : s === "Overdue" ? "text-destructive" : "text-warning";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Button variant="ghost" className="gap-2" onClick={() => navigate("/applicants")}>
        <ArrowLeft className="h-4 w-4" /> Back to Applicants
      </Button>

      {/* Header */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{applicant.fullName}</h1>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {applicant.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {applicant.phone}</span>
                    <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> {applicant.nationality}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={() => setEditOpen(true)}>
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>
              <div className="mt-4">
                <Badge className={`${STAGE_COLOR_MAP[applicant.stage]} border-0 text-sm px-3 py-1`}>{applicant.stage}</Badge>
              </div>
            </div>
          </div>

          {/* Stage stepper */}
          <div className="mt-6 flex items-center gap-1 overflow-x-auto pb-2">
            {PIPELINE_STAGES.filter(s => s !== "Rejected").map((stage, i) => {
              const idx = PIPELINE_STAGES.indexOf(stage);
              const isCurrent = stage === applicant.stage;
              const isPast = idx < currentStageIdx;
              return (
                <div key={stage} className="flex items-center">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${isCurrent ? STAGE_COLOR_MAP[stage] : isPast ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {stage}
                  </div>
                  {i < PIPELINE_STAGES.length - 2 && <ChevronRight className="h-3 w-3 text-muted-foreground mx-1 flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          {nextStage && applicant.stage !== "Rejected" && (
            <div className="mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="rounded-xl gap-2">
                    <ChevronRight className="h-4 w-4" /> Move to {nextStage}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Advance to {nextStage}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will move {applicant.fullName} from "{applicant.stage}" to "{nextStage}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => updateStage.mutate({ id: applicant.id, stage: nextStage as PipelineStage })}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 grid sm:grid-cols-2 gap-6">
              {[
                ["Date of Birth", format(new Date(applicant.dateOfBirth), "MMMM d, yyyy")],
                ["Country Applying To", applicant.countryApplyingTo],
                ["University", applicant.university],
                ["Course", applicant.course],
                ["Date Added", format(new Date(applicant.dateAdded), "MMMM d, yyyy")],
                ["Last Updated", format(new Date(applicant.lastUpdated), "MMMM d, yyyy")],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="font-medium mt-0.5">{value}</p>
                </div>
              ))}
              {applicant.notes && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-0.5">{applicant.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              {timeline && timeline.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                  {timeline.map(entry => (
                    <div key={entry.id} className="flex gap-4 relative">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 z-10">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{entry.action}</p>
                        {entry.fromStage && <p className="text-xs text-muted-foreground">{entry.fromStage} → {entry.toStage}</p>}
                        <p className="text-xs text-muted-foreground mt-1">{entry.createdBy} · {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No activity recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 space-y-3">
              {documents?.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border">
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    {doc.uploadedAt && <p className="text-xs text-muted-foreground">{format(new Date(doc.uploadedAt), "MMM d, yyyy")}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${docStatusColor(doc.status)} border-0 text-xs`}>{doc.status}</Badge>
                    <Button variant="outline" size="sm" className="gap-1 rounded-lg"><Upload className="h-3 w-3" /> Upload</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Payment Records</CardTitle>
              <Button variant="outline" size="sm" className="gap-1 rounded-xl"><Plus className="h-3 w-3" /> Add Payment</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{format(new Date(p.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{p.type}</TableCell>
                      <TableCell className="font-medium">${p.amount.toLocaleString()}</TableCell>
                      <TableCell><span className={`font-medium ${payStatusColor(p.status)}`}>{p.status}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-2">
                <Textarea placeholder="Add a note..." value={note} onChange={e => setNote(e.target.value)} rows={2} className="flex-1" />
                <Button onClick={addNote} className="self-end rounded-xl">Add</Button>
              </div>
              {notes.length > 0 ? notes.map((n, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted">
                  <p className="text-sm">{n.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{format(new Date(n.date), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              )) : (
                <p className="text-center text-muted-foreground text-sm py-4">No notes yet. Add one above.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ApplicantFormSheet open={editOpen} onOpenChange={setEditOpen} applicantId={id} />
    </motion.div>
  );
}
