import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicants } from "@/hooks/use-applicants";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { STAGE_COLOR_MAP, PIPELINE_STAGES } from "@/types/applicant";
import { LayoutDashboard, Users, GitBranch, Settings, ArrowRight } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { label: "Applicants", url: "/applicants", icon: Users },
  { label: "Pipeline", url: "/pipeline", icon: GitBranch },
  { label: "Settings", url: "/settings", icon: Settings },
];

export function CommandSearch({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const { data } = useApplicants({
    search: query.trim() || undefined,
    pageSize: 20,
  });

  const go = useCallback(
    (url: string) => {
      navigate(url);
      onOpenChange(false);
      setQuery("");
    },
    [navigate, onOpenChange],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search applicants, navigate pages…" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation group — always shown */}
        {!query && (
          <>
            <CommandGroup heading="Navigation">
              {NAV_ITEMS.map((item) => (
                <CommandItem key={item.url} value={`nav-${item.label}`} onSelect={() => go(item.url)} className="gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                  <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Pipeline Stages">
              {PIPELINE_STAGES.map((stage) => (
                <CommandItem key={stage} value={`stage-${stage}`} onSelect={() => go(`/pipeline?stage=${encodeURIComponent(stage)}`)} className="gap-3">
                  <Badge className={`${STAGE_COLOR_MAP[stage]} border-0 text-[10px] px-1.5`}>{stage}</Badge>
                  <span className="text-sm">View {stage} applicants</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Applicant search results */}
        {query && data && data.data.length > 0 && (
          <CommandGroup heading={`Applicants (${data.total} found)`}>
            {data.data.map((applicant) => {
              const initials = applicant.fullName
                .split(" ")
                .map((n) => n[0])
                .join("");
              return (
                <CommandItem key={applicant.id} value={`${applicant.fullName} ${applicant.email} ${applicant.stage}`} onSelect={() => go(`/applicants/${applicant.id}`)} className="gap-3 py-2">
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarFallback className={`${STAGE_COLOR_MAP[applicant.stage]} text-white text-xs font-bold`}>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{applicant.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{applicant.email}</p>
                  </div>
                  <Badge className={`${STAGE_COLOR_MAP[applicant.stage]} border-0 text-[10px] flex-shrink-0`}>{applicant.stage}</Badge>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
