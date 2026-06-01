import { Badge } from "@/components/ui/Badge";

export function DepartmentStatusBadge({ status }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case "ACTIVE":
        return { variant: "default", className: "bg-green-500 hover:bg-green-600" };
      case "INACTIVE":
        return { variant: "secondary", className: "bg-yellow-500 hover:bg-yellow-600 text-black" };
      case "ARCHIVED":
        return { variant: "outline", className: "border-gray-400 text-gray-500" };
      default:
        return { variant: "outline" };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={config.className}>
      {status}
    </Badge>
  );
}

export function ServiceUnitStatusBadge({ status }) {
  return <DepartmentStatusBadge status={status} />;
}

export function DepartmentTypeBadge({ type }) {
  const getTypeConfig = (type) => {
    switch (type) {
      case "CLINICAL":
        return { className: "bg-blue-100 text-blue-800 border-blue-300" };
      case "DIAGNOSTIC":
        return { className: "bg-purple-100 text-purple-800 border-purple-300" };
      case "PHARMACY":
        return { className: "bg-green-100 text-green-800 border-green-300" };
      case "ADMINISTRATIVE":
        return { className: "bg-gray-100 text-gray-800 border-gray-300" };
      case "FINANCE":
        return { className: "bg-yellow-100 text-yellow-800 border-yellow-300" };
      case "SUPPORT":
        return { className: "bg-orange-100 text-orange-800 border-orange-300" };
      default:
        return { className: "bg-gray-100 text-gray-800 border-gray-300" };
    }
  };

  const config = getTypeConfig(type);

  return (
    <Badge variant="outline" className={config.className}>
      {type}
    </Badge>
  );
}
