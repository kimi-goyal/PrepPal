import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const WaveMark = ({ animate = false }) => {
  const heights = [10, 18, 26, 16, 22, 12];
  return (
    <div className="flex items-end gap-[3px] h-7">
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-[#1E5F53] ${animate ? "animate-pulse" : ""}`}
          style={{ height: h, animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirect automatically if user state evaluates to authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // Change to your preferred post-login path (e.g. "/dashboard")
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      console.error("Login verification failed: ", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6F4] px-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-2xl border border-[#E3E1DB] shadow-[0_1px_2px_rgba(23,26,33,0.04)] p-9"
      >
        <div className="mb-8">
          <WaveMark animate={isLoading} />
          <h1 className="mt-5 text-[28px] leading-tight font-display font-medium text-[#171A21]">
            Welcome back
          </h1>
          <p className="text-sm text-[#6E6A62] mt-1.5">
            Log in to continue practicing for <span className="italic font-display">PrepPal</span>.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium tracking-wide uppercase text-[#6E6A62]">
              Email address
            </label>
            <div className="flex items-center mt-1.5 rounded-lg bg-[#F5F6F4] border border-[#E3E1DB] px-3 focus-within:border-[#1E5F53] focus-within:bg-white transition-colors">
              <Mail className="text-[#6E6A62] w-4 h-4 mr-2 shrink-0" />
              <input
                type="email"
                className="w-full bg-transparent text-[#171A21] py-2.5 text-sm focus:outline-none placeholder-[#9C988E]"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium tracking-wide uppercase text-[#6E6A62]">
              Password
            </label>
            <div className="flex items-center mt-1.5 rounded-lg bg-[#F5F6F4] border border-[#E3E1DB] px-3 focus-within:border-[#1E5F53] focus-within:bg-white transition-colors">
              <Lock className="text-[#6E6A62] w-4 h-4 mr-2 shrink-0" />
              <input
                type="password"
                className="w-full bg-transparent text-[#171A21] py-2.5 text-sm focus:outline-none placeholder-[#9C988E]"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-[#A6423A] text-sm bg-[#A6423A]/[0.06] border border-[#A6423A]/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end text-sm">
            <Link to="/forgot-password" className="text-[#1E5F53] hover:underline underline-offset-2">
              Forgot password?
            </Link>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-[#171A21] text-white text-sm font-medium rounded-lg transition-colors ${
              isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-[#1E5F53]"
            }`}
          >
            {isLoading ? <Loader className="animate-spin mx-auto w-4 h-4" /> : "Log in"}
          </motion.button>
        </form>

        <p className="text-sm text-center text-[#6E6A62] mt-7">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#1E5F53] font-medium hover:underline underline-offset-2">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;