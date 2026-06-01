import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useDashboardStats } from "../hooks/useDepartments";

export function DepartmentSummaryCards() {
  const { data: statsData, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return <div>Loading statistics...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading statistics</div>;
  }

  const stats = statsData?.data || {
    totalDepartments: 0,
    activeDepartments: 0,
    inactiveDepartments: 0,
    archivedDepartments: 0,
    totalServiceUnits: 0,
    departmentsWithoutManager: 0
  };

  const cards = [
    {
      title: "Total Departments",
      value: stats.totalDepartments,
      description: "All departments in the system"
    },
    {
      title: "Active",
      value: stats.activeDepartments,
      description: "Currently active departments",
      className: "bg-green-50 border-green-200"
    },
    {
      title: "Inactive",
      value: stats.inactiveDepartments,
      description: "Temporarily inactive",
      className: "bg-yellow-50 border-yellow-200"
    },
    {
      title: "Archived",
      value: stats.archivedDepartments,
      description: "Historical records",
      className: "bg-gray-50 border-gray-200"
    },
    {
      title: "Service Units",
      value: stats.totalServiceUnits,
      description: "Total service units"
    },
    {
      title: "Without Manager",
      value: stats.departmentsWithoutManager,
      description: "Needs attention",
      className: "bg-red-50 border-red-200"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <Card key={index} className={card.className}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
