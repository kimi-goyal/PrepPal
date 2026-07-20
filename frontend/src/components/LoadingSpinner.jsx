import { motion } from "framer-motion";

const LoadingSpinner = () => {
	return (
		<div className='min-h-screen bg-gradient-to-br from-[#0B0F19] via-[#141625] to-[#0B0F19] flex items-center justify-center relative overflow-hidden'>
			<motion.div
				className='w-16 h-16 border-4 border-t-[#FF5DA2] border-r-[#00F2E2] border-b-transparent border-l-transparent rounded-full'
				animate={{ rotate: 360 }}
				transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
			/>
		</div>
	);
};

export default LoadingSpinner;
