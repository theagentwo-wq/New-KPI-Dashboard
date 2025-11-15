import React, { useState, useEffect } from 'react';
import { MotionValue } from 'framer-motion';

interface AnimatedNumberDisplayProps {
  value: MotionValue<number>;
  formatter: (value: number) => string;
}

export const AnimatedNumberDisplay: React.FC<AnimatedNumberDisplayProps> = ({ value, formatter }) => {
  const [displayValue, setDisplayValue] = useState(formatter(value.get()));

  useEffect(() => {
    const unsubscribe = value.onChange((latest) => {
      setDisplayValue(formatter(latest));
    });
    return () => unsubscribe();
  }, [value, formatter]);

  return <>{displayValue}</>;
};
