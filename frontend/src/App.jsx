import { Navigate, Route, Routes } from "react-router-dom";
import FloatingShape from "./components/FloatingShape";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import SessionDetailedPage from "./pages/SessionDetailedPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import StartInterview from "./pages/StartInterview";
import LoadingSpinner from "./components/LoadingSpinner";
import InterviewPage from "./pages/InterviewPage";

const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();
	if (!isAuthenticated) return <Navigate to="/login" replace />;
	return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();
	if (isAuthenticated && user.isVerified) return <Navigate to="/" replace />;
	return children;
};

function App() {
	const { isCheckingAuth, checkAuth } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (isCheckingAuth) return <LoadingSpinner />;

	return (
		<div className="relative min-h-screen bg-gradient-to-br from-[#0B0F19] via-[#141625] to-[#0B0F19]">
			<FloatingShape color="bg-[#FF5DA2]" size="w-52 h-52" top="10%" left="5%" delay={0} />
			<FloatingShape color="bg-[#00F2E2]" size="w-40 h-40" top="60%" left="75%" delay={2} />
			<FloatingShape color="bg-[#5F27CD]" size="w-32 h-32" top="35%" left="50%" delay={1.2} />

			<Routes>
				<Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
				<Route path="/signup" element={<RedirectAuthenticatedUser><SignUpPage /></RedirectAuthenticatedUser>} />
				<Route path="/login" element={<RedirectAuthenticatedUser><LoginPage /></RedirectAuthenticatedUser>} />
				<Route path="/verify-email" element={<EmailVerificationPage />} />
				<Route path="/forgot-password" element={<RedirectAuthenticatedUser><ForgotPasswordPage /></RedirectAuthenticatedUser>} />
				<Route path="/reset-password/:token" element={<RedirectAuthenticatedUser><ResetPasswordPage /></RedirectAuthenticatedUser>} />
				<Route path="/start-interview" element={<ProtectedRoute><StartInterview /></ProtectedRoute>} />
				<Route path="/interview/:sessionId" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
				<Route path="/session/:sessionId" element={<ProtectedRoute><SessionDetailedPage /></ProtectedRoute>} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>

			<Toaster />
		</div>
	);
}

export default App;
