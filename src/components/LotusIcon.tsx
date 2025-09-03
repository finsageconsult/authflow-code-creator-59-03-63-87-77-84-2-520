import React from 'react';

interface LotusIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const LotusIcon: React.FC<LotusIconProps> = ({
  className = "",
  width = 82,
  height = 82
}) => {
  return (
    <div className={className}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 83 82"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="lotus-icon"
        style={{ width: `${width}px`, height: `${height}px`, flexShrink: 0 }}
        role="img"
        aria-label="Lotus flower icon"
      >
        <path
          d="M53.4583 32.9025C52.8091 23.37 48.9483 14.0767 41.705 6.83337C34.6978 13.813 30.3886 23.0486 29.5416 32.9025C33.9491 35.2259 37.9808 38.2325 41.5 41.8884C44.9976 38.2929 49.0317 35.2616 53.4583 32.9025ZM41.5 52.7875C34.1541 41.5809 21.615 34.1667 7.33331 34.1667C7.33331 68.3334 39.1766 74.7909 41.5 75.1667C43.8233 74.7567 75.6666 68.3334 75.6666 34.1667C61.385 34.1667 48.8458 41.5809 41.5 52.7875Z"
          fill="#5A9F94"
        />
      </svg>
    </div>
  );
};