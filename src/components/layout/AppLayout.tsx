import { ReactNode } from "react";
import { motion } from "framer-motion";
import { TopNavigation } from "./TopNavigation";
import { StudentLayout } from "./StudentLayout";
import { Breadcrumbs } from "./Breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const { activeRole } = useAuth();

  // Students get a special layout without full navigation
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
      <TopNavigation />
      
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs />
          
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </motion.div>
          
          {children}
        </div>
      </main>
    </div>
  );
}
