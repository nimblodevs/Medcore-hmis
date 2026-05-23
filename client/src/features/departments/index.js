// API
export { default as departmentsApi } from "./api/departments.api.js";

// Hooks
export * from "./hooks/useDepartments";

// Components
export { DepartmentSummaryCards } from "./components/DepartmentSummaryCards";
export { 
  DepartmentStatusBadge, 
  ServiceUnitStatusBadge, 
  DepartmentTypeBadge 
} from "./components/DepartmentStatusBadge";

// Pages
export { DepartmentsPage } from "./pages/DepartmentsPage";
