import { useEffect } from 'react';
import { useSpring } from 'framer-motion';

export const useAnimatedNumber = (value: number): any => {
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