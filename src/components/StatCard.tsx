import React from 'react';

interface StatCardProps {
  icon: string;
  percentage: string;
  description: string;
  backgroundColor: string;
  backgroundOpacity?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  percentage,
  description,
  backgroundColor,
  backgroundOpacity = "opacity-50"
}) => {
  return (
    <article className="flex w-[241px] h-[346px] flex-col justify-center items-center shrink-0 relative px-[42.273px] py-[40.615px] rounded-[33.155px] max-md:w-[calc(50%_-_10px)] max-md:min-w-[280px] max-sm:w-full max-sm:max-w-xs max-sm:h-auto max-sm:min-h-[300px]">
      <div
        className={`absolute w-full h-full z-[1] ${backgroundOpacity} rounded-[33.155px] left-0 top-0`}
        style={{ backgroundColor }}
      />
      <div className="flex flex-col items-center gap-[21.551px] relative z-[2] w-full">
        <div>
          <div
            dangerouslySetInnerHTML={{
              __html: icon,
            }}
          />
        </div>
        <div className="flex flex-col items-center gap-[18.235px] w-full">
          <div className="flex flex-col items-center gap-[12.433px] w-full">
            <div className="text-black text-center text-[40px] font-bold max-sm:text-4xl tracking-tight">
              {percentage}
            </div>
            <div className="text-black text-center text-base font-normal w-full h-[62px] max-sm:text-[15px] max-sm:w-full max-sm:h-auto">
              {description}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
