import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader, Lock, Mail, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuthStore } from "../store/authStore";

const WaveMark = () => {
  const heights = [10, 18, 26, 16, 22, 12];
  return (
    <div className="flex items-end gap-[3px] h-7">
      {heights.map((h, i) => (
        <span key={i} className="w-[3px] rounded-full bg-[#1E5F53]" style={{ height: h }} />
      ))}
    </div>
  );
};

const Field = ({ icon: Icon, label, ...props }) => (
  <div>
    <label className="text-xs font-medium tracking-wide uppercase text-[#6E6A62]">{label}</label>
    <div className="flex items-center mt-1.5 rounded-lg bg-[#F5F6F4] border border-[#E3E1DB] px-3 focus-within:border-[#1E5F53] focus-within:bg-white transition-colors">
      <Icon className="text-[#6E6A62] w-4 h-4 mr-2 shrink-0" />
      <input
        className="w-full bg-transparent text-[#171A21] py-2.5 text-sm focus:outline-none placeholder-[#9C988E]"
        {...props}
      />
    </div>
  </div>
);

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { signup, error, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password, name);
    } catch (err) {
      console.error("Signup submission tracking failed: ", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex justify-center items-center min-h-screen px-4 bg-[#F5F6F4] font-sans"
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E3E1DB] shadow-[0_1px_2px_rgba(23,26,33,0.04)] p-9">
        <div className="mb-8">
          <WaveMark />
          <h1 className="mt-5 text-[28px] leading-tight font-display font-medium text-[#171A21]">
            Create your account
          </h1>
          <p className="text-sm text-[#6E6A62] mt-1.5">
            Start practicing with <span className="italic font-display">PrepPal</span> in a few minutes.
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <Field
            icon={User}
            label="Full name"
            type="text"
            placeholder="Jordan Lee"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Field
            icon={Mail}
            label="Email address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Field
            icon={Lock}
            label="Password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-[#A6423A] text-sm bg-[#A6423A]/[0.06] border border-[#A6423A]/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <PasswordStrengthMeter password={password} />

          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-4 bg-[#171A21] text-white text-sm font-medium rounded-lg transition-colors ${
              isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-[#1E5F53]"
            }`}
          >
            {isLoading ? <Loader className="animate-spin mx-auto w-4 h-4" /> : "Sign up"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-[#6E6A62] mt-7">
          Already have an account?{" "}
          <Link to="/login" className="text-[#1E5F53] font-medium hover:underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default SignUpPage;