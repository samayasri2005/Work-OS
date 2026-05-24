import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

interface PageLayoutProps {
  breadcrumb?: string;
  title?: string;
  action?: { label: string; icon?: ReactNode; onClick?: () => void } | null;
  children: ReactNode;
}

export const PageLayout = ({ breadcrumb, title, action, children }: PageLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 px-5 md:px-8 py-6 max-w-[1600px] mx-auto w-full">
        <TopBar breadcrumb={breadcrumb} title={title} action={action} />
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};