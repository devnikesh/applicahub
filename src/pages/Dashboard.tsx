import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats, useRecentApplicants, useStageCounts } from "@/hooks/use-applicants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, TrendingUp, CheckCircle, Clock, ArrowUpRight, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STAGE_COLOR_MAP } from "@/types/applicant";
import { motion } from "framer-motion";
import { format } from "date-fns";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recent, isLoading: recentLoading } = useRecentApplicants();
  const { data: stageCounts, isLoading: stageCountsLoading } = useStageCounts();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const kpis = [
    { label: "Total Applicants", value: stats?.totalApplicants, icon: Users, trend: "+12%", color: "text-primary" },
    { label: "In Progress", value: stats?.inProgress, icon: TrendingUp, trend: "+5%", color: "text-info" },
    { label: "Approved / Visa Granted", value: stats?.approved, icon: CheckCircle, trend: "+8%", color: "text-success" },
    { label: "Pending Action", value: stats?.pendingAction, icon: Clock, trend: "-3%", color: "text-warning" },
  ];

  const totalForBar = stageCounts?.reduce((s, c) => s + c.count, 0) || 1;

  const goToPipelineStage = (stage: string) => {
    navigate(`/pipeline?stage=${encodeURIComponent(stage)}`);
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${kpi.trend.startsWith("+") ? "text-success" : "text-destructive"}`}>
                    <ArrowUpRight className={`h-3 w-3 ${kpi.trend.startsWith("-") ? "rotate-90" : ""}`} />
                    {kpi.trend}
                  </span>
                </div>
                {statsLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-bold">{kpi.value}</p>}
                <p className="text-sm text-muted-foreground mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pipeline Bar — Feature 5: clickable segments */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Pipeline Overview</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/pipeline")}>
              View pipeline →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stageCountsLoading ? (
            <Skeleton className="h-8 w-full rounded-full" />
          ) : (
            <div className="space-y-3">
              <div className="flex rounded-xl overflow-hidden h-7 border gap-px bg-border">
                {stageCounts
                  ?.filter((s) => s.count > 0)
                  .map((s) => {
                    const pct = (s.count / totalForBar) * 100;
                    return (
                      <Tooltip key={s.stage}>
                        <TooltipTrigger asChild>
                          <button
                            className={`${STAGE_COLOR_MAP[s.stage]} flex items-center justify-center hover:brightness-110 active:brightness-90 transition-all cursor-pointer`}
                            style={{ width: `${pct}%` }}
                            onClick={() => goToPipelineStage(s.stage)}
                            title={`${s.stage}: ${s.count}`}
                          >
                            {pct > 8 && <span className="text-[10px] font-semibold text-white drop-shadow">{s.count}</span>}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">{s.stage}</p>
                          <p className="text-xs opacity-75">
                            {s.count} applicant{s.count !== 1 ? "s" : ""} · {pct.toFixed(1)}%
                          </p>
                          <p className="text-xs text-primary mt-0.5">Click to view in pipeline →</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
              </div>
              <div className="flex flex-wrap gap-3">
                {stageCounts?.map((s) => (
                  <button key={s.stage} onClick={() => goToPipelineStage(s.stage)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <div className={`h-2.5 w-2.5 rounded-full ${STAGE_COLOR_MAP[s.stage]}`} />
                    {s.stage} ({s.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Applicants */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Recent Applicants</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/applicants")}>
            View all
          </Button>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Country</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent?.map((a) => (
                  <TableRow key={a.id} className="cursor-pointer" onClick={() => navigate(`/applicants/${a.id}`)}>
                    <TableCell className="font-medium">{a.fullName}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{a.countryApplyingTo}</TableCell>
                    <TableCell>
                      <Badge className={`${STAGE_COLOR_MAP[a.stage]} text-[10px] border-0`}>{a.stage}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{format(new Date(a.lastUpdated), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
