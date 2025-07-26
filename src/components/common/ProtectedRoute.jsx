import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import Loading from "./Loading";
import ErrorPage from "./errorPage";

const ProtectedRoute = ({
  redirectTo = "/login",
  requireActive = false,
  requireAdmin = false,
}) => {
  const { isAuthenticated, loading, isActive, isAdmin } =
    useContext(UserContext);

  if (loading) return <Loading />;

  if (!isAuthenticated) {
 
    return (
      <ErrorPage
        message="عذرًا، ليس لديك صلاحية الوصول إلى هذه الصفحة."
        redirectTo="/"
      />
    );
  }

  if (requireActive && isActive !== true) {

    return (
      <ErrorPage
        message="عذرًا، حسابك غير مفعل بعد. يرجى التواصل مع الدعم لتفعيله."
        redirectTo="/"
      />
    );
  }

  if (requireAdmin && isAdmin !== true) {
    return (
      <ErrorPage
        message="عذرًا، ليس لديك صلاحية الوصول إلى هذه الصفحة."
        redirectTo="/"
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
