import { PageLayout } from "@/components/dashboard/PageLayout";
import { OverviewCard } from "@/components/dashboard/OverviewCard";
import { TasksWidget } from "@/components/dashboard/TasksWidget";
import { NotesWidget } from "@/components/dashboard/NotesWidget";
import { LinksWidget } from "@/components/dashboard/LinksWidget";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { CustomWidgets } from "@/components/dashboard/CustomWidgets";

const Index = () => {
  return (
    <PageLayout breadcrumb="Dashboard / Overview" title="Hello, Thomas">
      <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12">
            <OverviewCard />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <TasksWidget />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <NotesWidget />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <CalendarWidget />
          </div>
          <div className="col-span-12 lg:col-span-8">
            <ActivityChart />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <LinksWidget />
          </div>
          <div className="col-span-12">
            <CustomWidgets />
          </div>
      </div>
    </PageLayout>
  );
};

export default Index;
