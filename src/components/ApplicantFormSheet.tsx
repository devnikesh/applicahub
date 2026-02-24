import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateApplicant, useUpdateApplicant, useApplicant } from "@/hooks/use-applicants";
import { PIPELINE_STAGES } from "@/types/applicant";
import { COUNTRIES_LIST } from "@/data/mock-data";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(5, "Phone is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  countryApplyingTo: z.string().min(1, "Country is required"),
  university: z.string().min(1, "University is required"),
  course: z.string().min(1, "Course is required"),
  stage: z.string().min(1, "Stage is required"),
  notes: z.string().optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  applicantId?: string;
}

export function ApplicantFormSheet({ open, onOpenChange, applicantId }: Props) {
  const isEdit = !!applicantId;
  const { data: existing } = useApplicant(applicantId || "");
  const createMut = useCreateApplicant();
  const updateMut = useUpdateApplicant();

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", dateOfBirth: "", nationality: "",
    countryApplyingTo: "", university: "", course: "", stage: "Inquiry" as string, notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && existing) {
      setForm({
        fullName: existing.fullName, email: existing.email, phone: existing.phone,
        dateOfBirth: existing.dateOfBirth.split("T")[0], nationality: existing.nationality,
        countryApplyingTo: existing.countryApplyingTo, university: existing.university,
        course: existing.course, stage: existing.stage, notes: existing.notes || "",
      });
    } else if (!isEdit) {
      setForm({ fullName: "", email: "", phone: "", dateOfBirth: "", nationality: "", countryApplyingTo: "", university: "", course: "", stage: "Inquiry", notes: "" });
    }
  }, [isEdit, existing, open]);

  const handleSubmit = async () => {
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach(e => { if (e.path[0]) errs[String(e.path[0])] = e.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    const payload = { ...form, stage: form.stage as any };
    if (isEdit && applicantId) {
      await updateMut.mutateAsync({ id: applicantId, data: payload });
    } else {
      await createMut.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isSubmitting = createMut.isPending || updateMut.isPending;
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Applicant" : "Add Applicant"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          {([
            ["fullName", "Full Name", "text"],
            ["email", "Email", "email"],
            ["phone", "Phone", "text"],
            ["dateOfBirth", "Date of Birth", "date"],
            ["university", "University / College", "text"],
            ["course", "Course", "text"],
          ] as const).map(([key, label, type]) => (
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <Input type={type} value={form[key]} onChange={e => set(key, e.target.value)} />
              {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
            </div>
          ))}

          <div className="space-y-1.5">
            <Label>Nationality</Label>
            <Select value={form.nationality} onValueChange={v => set("nationality", v)}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {COUNTRIES_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.nationality && <p className="text-xs text-destructive">{errors.nationality}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Country Applying To</Label>
            <Select value={form.countryApplyingTo} onValueChange={v => set("countryApplyingTo", v)}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {COUNTRIES_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.countryApplyingTo && <p className="text-xs text-destructive">{errors.countryApplyingTo}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Stage</Label>
            <Select value={form.stage} onValueChange={v => set("stage", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3} />
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full rounded-xl h-11 mt-4">
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Applicant"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
