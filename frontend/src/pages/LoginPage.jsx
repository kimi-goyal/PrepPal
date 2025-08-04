import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4e013e] to-[#543254] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#161B22] text-white w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/10"
      >
        <div className="text-center mb-6">
          <div className="relative mb-4 flex justify-center">
            <div className="w-16 h-16 bg-[#FF5DA2] rounded-2xl flex items-center justify-center shadow-lg rotate-12 animate-pulse">
              <Mail className="text-white w-7 h-7 -rotate-12" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#00F2E2] rounded-full animate-ping" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#00F2E2] rounded-full" />
          </div>
          <h2 className="text-3xl font-bold tracking-wide">
            Login to <span className="text-[#FF5DA2]">PrepPal</span>
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1">Welcome back! Let’s get you ready.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-[#94A3B8]">Email Address</label>
            <div className="flex items-center mt-2 rounded-lg bg-[#1A1A1A] border border-[#2D3748] px-3">
              <Mail className="text-[#FF5DA2] w-5 h-5 mr-2" />
              <input
                type="email"
                className="w-full bg-transparent text-white py-2 focus:outline-none"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#94A3B8]">Password</label>
            <div className="flex items-center mt-2 rounded-lg bg-[#1A1A1A] border border-[#2D3748] px-3">
              <Lock className="text-[#FF5DA2] w-5 h-5 mr-2" />
              <input
                type="password"
                className="w-full bg-transparent text-white py-2 focus:outline-none"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-between items-center text-sm">
            <Link to="/forgot-password" className="text-[#00F2E2] hover:underline">
              Forgot Password?
            </Link>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-[#FF5DA2] text-black font-bold rounded-full transition ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#FEE440]"
            }`}
          >
            {isLoading ? <Loader className="animate-spin mx-auto w-5 h-5" /> : "Login"}
          </motion.button>
        </form>

        <p className="text-sm text-center text-[#94A3B8] mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#00F2E2] hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
