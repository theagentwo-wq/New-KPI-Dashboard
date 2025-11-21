import React, { useState, useEffect } from 'react';

interface AnimatedNumberDisplayProps {
  value: any;
  formatter: (value: number) => string;
}

export const AnimatedNumberDisplay: React.FC<AnimatedNumberDisplayProps> = ({ value, formatter }) => {
  const [displayValue, setDisplayValue] = useState(formatter(value.get()));

  useEffect(() => {
    const unsubscribe = value.onChange((latest: number) => {
      setDisplayValue(formatter(latest));
    });
    return () => unsubscribe();
  }, [value, formatter]);

  return <>{displayValue}</>;
};