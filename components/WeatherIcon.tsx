import React from 'react';
import { WeatherCondition } from '../types';

interface WeatherIconProps {
  condition: WeatherCondition;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className = 'w-6 h-6' }) => {
  const commonProps = {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 64 64",
    className,
  };

  switch (condition) {
    case 'sunny':
      return (
        <svg {...commonProps}>
          <g>
            <circle cx="32" cy="32" r="12" fill="#FBBF24" />
            <g className="animate-sun-spin" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round">
              <line x1="32" y1="12" x2="32" y2="6" />
              <line x1="32" y1="52" x2="32" y2="58" />
              <line x1="52" y1="32" x2="58" y2="32" />
              <line x1="12" y1="32" x2="6" y2="32" />
              <line x1="45.25" y1="18.75" x2="49.5" y2="14.5" />
              <line x1="18.75" y1="45.25" x2="14.5" y2="49.5" />
              <line x1="45.25" y1="45.25" x2="49.5" y2="49.5" />
              <line x1="18.75" y1="18.75" x2="14.5" y2="14.5" />
            </g>
          </g>
        </svg>
      );
    case 'cloudy':
       return (
        <svg {...commonProps}>
            <path d="M46.6,27.2a12.8,12.8,0,0,0-24-4.8,10.8,10.8,0,0,0-1.6,21.6h27.2a9.6,9.6,0,0,0,0-19.2,12.2,12.2,0,0,0-1.6-2.4Z"
                fill="#94A3B8" stroke="#E2E8F0" strokeWidth="2" strokeLinejoin="round" className="animate-cloud-float" />
        </svg>
    );
    case 'rain':
      return (
        <svg {...commonProps}>
          <path d="M46.6,27.2a12.8,12.8,0,0,0-24-4.8,10.8,10.8,0,0,0-1.6,21.6h27.2a9.6,9.6,0,0,0,0-19.2,12.2,12.2,0,0,0-1.6-2.4Z"
                fill="#94A3B8" stroke="#E2E8F0" strokeWidth="2" strokeLinejoin="round" />
          <g stroke="#60A5FA" strokeWidth="2" strokeLinecap="round">
            <line x1="28" y1="50" x2="28" y2="50" className="animate-rain-drop" style={{ animationDelay: '0.1s' }} />
            <line x1="36" y1="50" x2="36" y2="50" className="animate-rain-drop" style={{ animationDelay: '0.6s' }} />
            <line x1="20" y1="50" x2="20" y2="50" className="animate-rain-drop" style={{ animationDelay: '0.3s' }} />
          </g>
        </svg>
      );
    case 'snow':
       return (
        <svg {...commonProps}>
            <path d="M46.6,27.2a12.8,12.8,0,0,0-24-4.8,10.8,10.8,0,0,0-1.6,21.6h27.2a9.6,9.6,0,0,0,0-19.2,12.2,12.2,0,0,0-1.6-2.4Z"
                    fill="#94A3B8" stroke="#E2E8F0" strokeWidth="2" strokeLinejoin="round" />
            <g fill="#E0F2FE">
                 <circle cx="28" cy="50" r="2" className="animate-snow-flake" style={{ animationDelay: '0.1s' }}/>
                 <circle cx="36" cy="50" r="2" className="animate-snow-flake" style={{ animationDelay: '0.6s' }}/>
                 <circle cx="20" cy="50" r="2" className="animate-snow-flake" style={{ animationDelay: '0.3s' }}/>
            </g>
        </svg>
       );
    case 'thunderstorm':
      return (
          <svg {...commonProps}>
              <path d="M46.6,27.2a12.8,12.8,0,0,0-24-4.8,10.8,10.8,0,0,0-1.6,21.6h27.2a9.6,9.6,0,0,0,0-19.2,12.2,12.2,0,0,0-1.6-2.4Z"
                  fill="#64748B" stroke="#94A3B8" strokeWidth="2" strokeLinejoin="round" />
              <polygon points="30 42, 24 52, 36 52, 30 62" fill="#FBBF24" className="animate-flash" />
          </svg>
      );
    case 'windy':
        return (
            <svg {...commonProps}>
                 <g className="animate-cloud-float">
                    <path d="M46.6,27.2a12.8,12.8,0,0,0-24-4.8,10.8,10.8,0,0,0-1.6,21.6h27.2a9.6,9.6,0,0,0,0-19.2,12.2,12.2,0,0,0-1.6-2.4Z"
                        fill="#94A3B8" stroke="#E2E8F0" strokeWidth="2" strokeLinejoin="round" />
                 </g>
                <g stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" fill="none">
                    <path d="M12 48 Q 20 44, 28 48" className="animate-wind-blow" style={{ animationDelay: '0s' }}/>
                    <path d="M16 54 Q 26 50, 36 54" className="animate-wind-blow" style={{ animationDelay: '0.2s' }}/>
                </g>
            </svg>
        );
    case 'loading':
        return (
            <svg {...commonProps} className={`${className} animate-spin`}>
                <circle cx="32" cy="32" r="14" stroke="#64748B" strokeWidth="4" fill="none" strokeDasharray="80" strokeDashoffset="60" />
            </svg>
        );
    default:
        // Fallback to a cloudy icon for any other unhandled conditions.
        return (
            <svg {...commonProps}>
                <path d="M46.6,27.2a12.8,12.8,0,0,0-24-4.8,10.8,10.8,0,0,0-1.6,21.6h27.2a9.6,9.6,0,0,0,0-19.2,12.2,12.2,0,0,0-1.6-2.4Z"
                    fill="#94A3B8" stroke="#E2E8F0" strokeWidth="2" strokeLinejoin="round" />
            </svg>
        );
  }
};