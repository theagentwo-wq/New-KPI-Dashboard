import React from 'react';

interface AnimatedNumberDisplayProps {
  value: number;
  formatter: (value: number) => string;
}

export const AnimatedNumberDisplay: React.FC<AnimatedNumberDisplayProps> = ({ value, formatter }) => {
  return <>{formatter(value)}</>;
};