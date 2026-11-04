import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import type { PointerEvent, ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

export default function TiltCard({ children, className = '' }: TiltCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 220, damping: 22 };
  const rotateX: MotionValue<number> = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY: MotionValue<number> = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), springConfig);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className={`h-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
