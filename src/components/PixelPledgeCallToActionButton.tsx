
import React, { useState } from 'react';

interface PixelPledgeCallToActionButtonProps {
  text: string;
  onClick?: () => void;
}

export const PixelPledgeCallToActionButton: React.FC<PixelPledgeCallToActionButtonProps> = ({
  text,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default action - could open a modal or navigate
      alert('Demo request submitted! We will contact you soon.');
    }
  };

  return (
    <button
      className={`flex w-[318px] h-[60px] flex-col justify-center items-center gap-[7.939px] relative cursor-pointer px-[14.291px] py-[6.351px] rounded-[39.697px] max-md:w-full max-md:max-w-[400px] transition-all duration-300 bg-gradient-to-br from-[#8DB3AB] to-[#597771] ${
        isHovered
          ? 'opacity-90 transform scale-105'
          : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      aria-label={text}
    >
      <div className="flex h-[26.2px] items-center gap-[11.909px] shrink-0 relative">
        <div className="w-[241px] h-[31px] text-white text-center text-[19px] font-semibold tracking-[0.762px] relative max-sm:text-base">
          {text}
        </div>
      </div>
    </button>
  );
};
