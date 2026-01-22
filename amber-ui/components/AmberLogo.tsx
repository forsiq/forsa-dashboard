
import React from 'react';

interface LogoProps {
  className?: string;
}

export const AmberLogo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 1536 1024" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      aria-label="ZoneVast Logo"
    >
      <g transform="matrix(3.595128 0 0 3.741776 -2022.281788 -1297.138762)">
        <rect 
          width="153.6" 
          height="102.4" 
          transform="matrix(0.776295 0 0 0.678964 624.140778 550.804788)" 
          fill="#FFC000" 
        />
        <path 
          d="M624.140778,347.490943q191.755416-.826997,190.92842-.826997t-152.167297,177.804178h-38.761123v-176.977181Z" 
          fill="#FFC000" 
          stroke="#FFC000" 
          strokeWidth="3.072"
        />
        <path 
          d="M853.938018,346.663946L700.943725,524.468125c2.705545,2.840823,127.400008-2.613192,161.164018-.000001s48.066015,16.99144,48.066015,16.99144l-1.653994-193.968621-54.581746-.826997Z" 
          transform="translate(-0.76547 0)" 
          fill="#FFC000" 
          stroke="#FFC000" 
          strokeWidth="3.072"
        />
        <path 
          d="M1313.289727,489.759319l143.169352-.308555c0,0,0-75.287333-73.744559-75.287333s-69.424793,75.595888-69.424793,75.595888Z" 
          transform="translate(-547.050791 130.571383)" 
          fill="#FFC000" 
          stroke="#FFC000" 
          strokeWidth="3.072"
        />
      </g>
    </svg>
  );
};
