const PageWrapper = ({ children, className = '', showGlow = true }) => {
	return (
		<div className={`min-h-screen bg-gradient-to-br from-[#0B0F19] via-[#141625] to-[#0B0F19] text-white ${className}`}>
			{showGlow && (
				<>
					<div className='fixed top-0 left-0 w-96 h-96 bg-[#5F27CD] opacity-20 blur-[128px] rounded-full pointer-events-none' />
					<div className='fixed bottom-0 right-0 w-96 h-96 bg-[#FF5DA2] opacity-20 blur-[128px] rounded-full pointer-events-none' />
				</>
			)}
			<div className='relative z-10'>
				{children}
			</div>
		</div>
	);
};

export default PageWrapper;
