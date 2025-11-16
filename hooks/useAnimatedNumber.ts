



import { useEffect } from 'react';
import { useSpring, MotionValue } from 'framer-motion';

export const useAnimatedNumber = (value: number): MotionValue<number> => {
  const spring = useSpring(value, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return spring;
};