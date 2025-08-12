import React from 'react';

interface SeiwakaiCloverIconProps {
  className?: string;
}

export const SeiwakaiCloverIcon: React.FC<SeiwakaiCloverIconProps> = ({ 
  className = '' 
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 四つ葉のクローバー */}
      <g transform="translate(50,50)">
        {/* 上の葉 */}
        <path
          d="M 0,-10 C -8,-20 -12,-30 -6,-35 C 0,-40 6,-35 12,-30 C 8,-20 0,-10 0,-10"
          fill="currentColor"
          opacity="0.9"
        />
        
        {/* 右の葉 */}
        <path
          d="M 10,0 C 20,-8 30,-12 35,-6 C 40,0 35,6 30,12 C 20,8 10,0 10,0"
          fill="currentColor"
          opacity="0.9"
        />
        
        {/* 下の葉 */}
        <path
          d="M 0,10 C 8,20 12,30 6,35 C 0,40 -6,35 -12,30 C -8,20 0,10 0,10"
          fill="currentColor"
          opacity="0.9"
        />
        
        {/* 左の葉 */}
        <path
          d="M -10,0 C -20,8 -30,12 -35,6 C -40,0 -35,-6 -30,-12 C -20,-8 -10,0 -10,0"
          fill="currentColor"
          opacity="0.9"
        />
        
        {/* 中央の茎 */}
        <circle
          cx="0"
          cy="0"
          r="3"
          fill="currentColor"
        />
        
        {/* ハイライト効果 */}
        <path
          d="M -2,-8 C -6,-15 -8,-20 -4,-22 C 0,-24 4,-22 8,-20 C 6,-15 2,-8 0,-6"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M 8,-2 C 15,-6 20,-8 22,-4 C 24,0 22,4 20,8 C 15,6 8,2 6,0"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M 2,8 C 6,15 8,20 4,22 C 0,24 -4,22 -8,20 C -6,15 -2,8 0,6"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M -8,2 C -15,6 -20,8 -22,4 C -24,0 -22,-4 -20,-8 C -15,-6 -8,-2 -6,0"
          fill="currentColor"
          opacity="0.3"
        />
      </g>
    </svg>
  );
};