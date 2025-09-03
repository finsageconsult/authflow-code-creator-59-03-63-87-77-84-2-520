import React from 'react';

interface StatsCardProps {
  percentage: string;
  description: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ percentage, description }) => {
  return (
    <article className="flex flex-col items-center gap-9 max-md:flex-1 max-md:min-w-[200px] max-md:gap-5 max-sm:w-full max-sm:gap-[15px]">
      <div className="text-black text-center text-[86px] font-bold leading-[91px] h-[91px] flex items-center justify-center max-md:text-6xl max-md:leading-[65px] max-md:h-auto max-sm:text-5xl max-sm:leading-[52px]">
        <div>{percentage}</div>
      </div>
      <div className="text-black text-center text-2xl font-normal w-[222px] h-[74px] flex items-center justify-center max-md:text-lg max-md:w-auto max-md:max-w-[200px] max-md:h-auto max-sm:text-base max-sm:max-w-[280px]">
        <div>{description}</div>
      </div>
    </article>
  );
};