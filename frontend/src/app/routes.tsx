import { createBrowserRouter } from "react-router";

import SplashPage from "./pages/SplashPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import StudentsPage from "./pages/StudentsPage";
import AddStudentPage from "./pages/AddStudentPage";
import EditStudentPage from "./pages/EditStudentPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import ActivityLibraryPage from "./pages/ActivityLibraryPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import AIActivityGeneratorPage from "./pages/AIActivityGeneratorPage";
import ALPIDashboardPage from "./pages/ALPIDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import FACPAssessmentPage from "./pages/FACPAssessmentPage";
import DataCollectionPage from "./pages/DataCollectionPage";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

import PictureIdentificationGame from "./games/PictureIdentificationGame";
import DragDropGame from "./games/DragandDropGame";
import MemoryGame from "./games/MemoryGame";
import SequenceGame from "./games/SequenceGame";
import EmotionMatchingGame from "./games/EmotionMatchingGame";
import HandwashingGame from "./games/HandwashingGame";
import MoneyMatchingGame from "./games/MoneyMatchingGame";
import LearningScreenPage from "./pages/LearningScreenPage";
import LearningModulesPage from "./pages/LearningModulesPage";
import LearningModuleDetailsPage from "./pages/LearningModuleDetailsPage";
import GeneratedGamePage from "./pages/GeneratedGamePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SplashPage />,
  },

  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/register",
    element: <RegisterPage />,
  },

  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/students",
    element: (
      <RoleProtectedRoute roles={["admin", "teacher"]}>
        <StudentsPage />
      </RoleProtectedRoute>
    ),
  },

  {
    path: "/students/add",
    element: (
      <RoleProtectedRoute roles={["admin"]}>
        <AddStudentPage />
      </RoleProtectedRoute>
    ),
  },

  {
    path: "/students/edit/:id",
    element: (
      <RoleProtectedRoute roles={["admin", "teacher"]}>
        <EditStudentPage />
      </RoleProtectedRoute>
    ),
  },

  {
    path: "/students/:id",
    element: (
      <RoleProtectedRoute roles={["admin", "teacher"]}>
        <StudentProfilePage />
      </RoleProtectedRoute>
    ),
  },

  /* =========================
     LEARNING GAMES
     ========================= */

  {
  path: "/learn/:activityId",
  element: (
    <ProtectedRoute>
      <LearningScreenPage />
    </ProtectedRoute>
  ),
},

{
  path: "/learn/:game",
  element: (
    <ProtectedRoute>
      <LearningScreenPage />
    </ProtectedRoute>
  ),
},
  {
    path: "/learn/picture-identification",
    element: (
      <ProtectedRoute>
        <LearningScreenPage />
      </ProtectedRoute>
    ),
  },
/** learn/shape-matching */
  {
    path: "/learn/drag-drop",
    element: (
      <ProtectedRoute>
        <LearningScreenPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/learn/memory",
    element: (
      <ProtectedRoute>
        <LearningScreenPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/facp",
    element: (
      <RoleProtectedRoute roles={["admin", "teacher"]}>
        <FACPAssessmentPage />
      </RoleProtectedRoute>
    ),
  },

  { path: "/learn/sequence", element: <ProtectedRoute><LearningScreenPage /></ProtectedRoute> },
  { path: "/learn/emotions", element: <ProtectedRoute><LearningScreenPage /></ProtectedRoute> },
  { path: "/learn/handwashing", element: <ProtectedRoute><LearningScreenPage /></ProtectedRoute> },
  { path: "/learn/money", element: <ProtectedRoute><LearningScreenPage /></ProtectedRoute> },

  {
    path: "/activities",
    element: (
      <RoleProtectedRoute roles={["admin", "teacher"]}>
        <ActivityLibraryPage />
      </RoleProtectedRoute>
    ),
  },
  {
  path: "/learning-modules",
  element: (
    <RoleProtectedRoute roles={["admin", "teacher"]}>
      <LearningModulesPage />
    </RoleProtectedRoute>
  ),
},
  {
    path: "/generated-game/:moduleId",
    element: (
      <ProtectedRoute>
        <GeneratedGamePage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/learning-modules/:moduleId",
    element: (
      <ProtectedRoute>
        <LearningModuleDetailsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/observation/:studentId",
    element: (
      <RoleProtectedRoute roles={["admin", "teacher"]}>
        <FACPAssessmentPage />
      </RoleProtectedRoute>
    ),
  },

  {
    path: "/analytics",
    element: (
      <RoleProtectedRoute roles={["admin", "teacher"]}>
        <ALPIDashboardPage />
      </RoleProtectedRoute>
    ),
  },

  {
    path: "/reports",
    element: (
      <RoleProtectedRoute roles={["admin", "teacher"]}>
        <ReportsPage />
      </RoleProtectedRoute>
    ),
  },

  {
    path: "/data-collection",
    element: (
      <RoleProtectedRoute roles={["admin", "teacher"]}>
        <DataCollectionPage />
      </RoleProtectedRoute>
    ),
  },

  {
    path: "/settings",
    element: (
      <RoleProtectedRoute roles={["admin", "teacher"]}>
        <SettingsPage />
      </RoleProtectedRoute>
    ),
  },

  {
    path: "/ai-generator",
    element: (
      <RoleProtectedRoute roles={["admin", "teacher"]}>
        <AIActivityGeneratorPage />
      </RoleProtectedRoute>
    ),
  },

  {
    path: "/admin",
    element: (
      <RoleProtectedRoute roles={["admin"]}>
        <AdminDashboardPage />
      </RoleProtectedRoute>
    ),
  },

  // {
  //   path: "*",
  //   element: <SplashPage />,
  // },
]);

export default router;