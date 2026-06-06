import { useState } from "react";
import { Plus } from "lucide-react";
import { PageLayout } from "@/components/dashboard/PageLayout";
import { TasksSidebar } from "@/components/tasks/TasksSidebar";
import { TasksList } from "@/components/tasks/TasksList";

const Tasks = () => {
  const [activeView, setActiveView] = useState("inbox");

  return (
    <PageLayout
      breadcrumb="Workspace / Tasks"
      title="Tasks"
    >
      <div className="flex h-[calc(100vh-140px)] border border-border rounded-lg bg-card/50 shadow-sm overflow-hidden mt-4">
        <TasksSidebar activeView={activeView} onSelectView={setActiveView} />
        <div className="flex-1 overflow-hidden bg-background">
          <TasksList viewId={activeView} />
        </div>
      </div>
    </PageLayout>
  );
};

export default Tasks;