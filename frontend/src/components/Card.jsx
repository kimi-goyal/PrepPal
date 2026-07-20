const Card = ({ children, className = '', hover = true }) => {
	return (
		<div
			className={`p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-md ${
				hover ? 'hover:scale-[1.02] transition-all duration-300' : ''
			} ${className}`}
		>
			{children}
		</div>
	);
};

export default Card;
