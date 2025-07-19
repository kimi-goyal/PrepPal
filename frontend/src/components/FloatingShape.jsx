import React, { useState } from 'react';
import { motion } from 'framer-motion';

function FloatingShape({ color, size, top, left, delay }) {
  return (
    <motion.div
      className={`absolute rounded-full ${color} ${size} opacity-20 blur-3xl`} 
      style={{ top, left }}
      animate={{
        y: ['0%', '100%', '0%'],
        x: ['0%', '100%', '0%'],
        rotate: [0, 360],
      }}
      transition={{
        duration: 25,
        ease: 'linear',
        repeat: Infinity,
        delay,
      }}
      aria-hidden='true'
    />
  );
}

export default FloatingShape;