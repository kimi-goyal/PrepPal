import { motion } from "framer-motion";
import Input from "../components/Input";
import { Loader, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuthStore } from "../store/authStore";

const SignUpPage = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const { signup, error, isLoading } = useAuthStore();

	const handleSignUp = async (e) => {
		e.preventDefault();
		try {
			await signup(email, password, name);
			navigate("/");
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='flex justify-center items-center min-h-screen bg-gradient-to-br from-[#1C1F2A] to-[#2F4454] px-4'
		>
			<div className='w-full max-w-md p-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl'>
				<h2 className='text-center text-3xl font-bold mb-6 bg-gradient-to-r from-[#FF5DA2] to-[#00F2E2] text-transparent bg-clip-text'>
					Create Your Account
				</h2>

				<form onSubmit={handleSignUp} className='space-y-4'>
					<Input
						icon={User}
						type='text'
						placeholder='Full Name'
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<Input
						icon={Mail}
						type='email'
						placeholder='Email Address'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<Input
						icon={Lock}
						type='password'
						placeholder='Password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					{error && <p className='text-red-500 font-medium'>{error}</p>}
					<PasswordStrengthMeter password={password} />

					<motion.button
						type='submit'
						disabled={isLoading}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className='w-full py-3 px-4 bg-gradient-to-r from-[#5F27CD] to-[#FF5DA2] text-white font-semibold rounded-xl shadow-md hover:opacity-90 transition-all duration-200'
					>
						{isLoading ? (
							<Loader className='animate-spin mx-auto' size={24} />
						) : (
							"Sign Up"
						)}
					</motion.button>
				</form>

				<p className='text-center text-sm text-gray-400 mt-6'>
					Already have an account?{" "}
					<Link
						to='/login'
						className='text-[#00F2E2] hover:underline transition-colors duration-150'
					>
						Login
					</Link>
				</p>
			</div>
		</motion.div>
	);
};

export default SignUpPage;
