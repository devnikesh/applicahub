import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { z } from "zod";

const passwordSchema = z.object({
  current: z.string().min(1, "Current password required"),
  newPassword: z.string().min(8, "Min 8 characters"),
  confirm: z.string(),
}).refine(d => d.newPassword === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [pwForm, setPwForm] = useState({ current: "", newPassword: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  const handleProfileSave = () => toast({ title: "Profile saved", description: "Your profile has been updated." });

  const handlePasswordChange = () => {
    const result = passwordSchema.safeParse(pwForm);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach(e => { if (e.path[0]) errs[String(e.path[0])] = e.message; });
      setPwErrors(errs);
      return;
    }
    setPwErrors({});
    toast({ title: "Password changed", description: "Your password has been updated." });
    setPwForm({ current: "", newPassword: "", confirm: "" });
  };

  const initials = user?.name?.split(" ").map(n => n[0]).join("") || "U";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="rounded-2xl shadow-sm max-w-lg">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="rounded-xl">Change avatar</Button>
              </div>
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" />
              </div>
              <Button onClick={handleProfileSave} className="rounded-xl">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="rounded-2xl shadow-sm max-w-lg">
            <CardHeader><CardTitle className="text-lg">Change Password</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(["current", "newPassword", "confirm"] as const).map(k => (
                <div key={k} className="space-y-1.5">
                  <Label>{k === "current" ? "Current Password" : k === "newPassword" ? "New Password" : "Confirm Password"}</Label>
                  <Input type="password" value={pwForm[k]} onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))} />
                  {pwErrors[k] && <p className="text-xs text-destructive">{pwErrors[k]}</p>}
                </div>
              ))}
              <Button onClick={handlePasswordChange} className="rounded-xl">Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="rounded-2xl shadow-sm max-w-lg">
            <CardContent className="p-6 space-y-6">
              {[
                ["Email Notifications", "Receive email updates about applicant changes"],
                ["Push Notifications", "Get browser notifications for new inquiries"],
                ["Weekly Digest", "Receive a weekly summary email"],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
