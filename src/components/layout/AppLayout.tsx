import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { CommandSearch } from "@/components/CommandSearch";

export function AppLayout() {
  const [cmdOpen, setCmdOpen] = useState(false);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onOpenSearch={() => setCmdOpen(true)} />
          <motion.main className="flex-1 p-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Outlet />
          </motion.main>
        </div>
      </div>
      <CommandSearch open={cmdOpen} onOpenChange={setCmdOpen} />
    </SidebarProvider>
  );
}
