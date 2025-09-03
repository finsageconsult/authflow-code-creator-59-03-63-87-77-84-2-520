import React from 'react';

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  className?: string;
}

export const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, className = "" }) => {
  return (
    <div className={`flex items-center gap-[12.62px] relative max-md:flex-col max-md:gap-3 max-md:items-center max-md:text-center max-sm:w-full max-sm:flex-col max-sm:gap-3 max-sm:items-center max-sm:justify-center max-sm:text-center ${className}`}>
      <div className="w-full flex items-center justify-center max-sm:w-full max-sm:mx-auto [&_svg]:mx-auto [&_svg]:block max-sm:[&_svg]:w-10 max-sm:[&_svg]:h-auto">
        {icon}
      </div>
      <div className="text-black text-center text-sm font-normal relative w-auto whitespace-nowrap leading-none max-md:max-w-[200px] max-md:text-center max-sm:text-xs max-sm:!text-center max-sm:w-full">
        {title}
      </div>
    </div>
  );
};