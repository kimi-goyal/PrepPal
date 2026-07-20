import { motion } from "framer-motion";

const variantStyles = {
	primary: 'bg-gradient-to-r from-[#5F27CD] to-[#00F2E2] text-white font-semibold rounded-xl px-5 py-2.5 hover:opacity-90 shadow-md',
	secondary: 'bg-[#FF5DA2] text-white font-semibold rounded-xl px-5 py-2.5 hover:opacity-90 shadow-md',
	ghost: 'bg-white/5 text-white border border-white/10 rounded-xl px-5 py-2.5 hover:bg-white/10',
};

const Button = ({ children, variant = 'primary', className = '', disabled = false, ...rest }) => {
	return (
		<motion.button
			whileHover={disabled ? {} : { scale: 1.02 }}
			whileTap={disabled ? {} : { scale: 0.98 }}
			className={`${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
			disabled={disabled}
			{...rest}
		>
			{children}
		</motion.button>
	);
};

export default Button;
