import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

interface AnimatedNumberDisplayProps {
  value: number;
  formatter: (value: number) => string;
}

export const AnimatedNumberDisplay: React.FC<AnimatedNumberDisplayProps> = ({
  value,
  formatter
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(value);

  // Create a spring animation for smooth counting
  const spring = useSpring(prevValueRef.current, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Update the spring target when value changes
    spring.set(value);
    prevValueRef.current = value;
  }, [value, spring]);

  useEffect(() => {
    // Subscribe to spring changes and update display value
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(latest);
    });

    return () => unsubscribe();
  }, [spring]);

  return (
    <motion.span
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {formatter(displayValue)}
    </motion.span>
  );
};