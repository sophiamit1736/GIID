import { Navigate } from "react-router";

interface Props {
  children: React.ReactNode;
  roles: string[];
}

export default function RoleProtectedRoute({
  children,
  roles,
}: Props) {

  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user.role) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}