import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { StudentLayout } from "./StudentLayout";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [sidebarCollapsed] = useState(false);
  const { activeRole } = useAuth();

  // Students get a special layout without sidebar
  const isStudent = activeRole === "estudiante";

  if (isStudent) {
    return (
      <StudentLayout title={title} subtitle={subtitle}>
        {children}
      </StudentLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        className="flex flex-col min-h-screen"
      >
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-6">{children}</main>
      </motion.div>
    </div>
  );
}
