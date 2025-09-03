import React from 'react';
interface StatisticsCardProps {
  backgroundImage: string;
  statNumber: string;
  statDescription: string;
}
export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  backgroundImage,
  statNumber,
  statDescription
}) => {
  return <div className="flex flex-col relative min-h-[551px] min-w-60 text-2xl text-[rgba(53,115,105,1)] font-semibold text-center leading-[31px] grow shrink w-[373px] pt-[378px] pb-7 px-[21px] rounded-[29px] max-md:max-w-full max-md:pt-[100px] max-md:px-5">
      <img src={backgroundImage} alt="Background" className="absolute h-full w-full object-cover inset-0 rounded-[28.84px]" />
      
      {/* Statistics overlay card */}
      <div className="absolute bottom-[30px] left-[20px] bg-white rounded-[16px] p-[20px] shadow-lg w-[208.66px] h-[145px]">
        <div className="text-[#357369] text-[32px] font-bold leading-none mb-[8px]">
          {statNumber}
        </div>
        <div className="text-[#357369] text-[14px] font-medium mb-[4.72px]">
          {statDescription}
        </div>
        <div className="flex gap-[4px] justify-center">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-[16px] h-[16px]">
              <svg viewBox="0 0 16 16" fill="#FF6B35" className="w-full h-full">
                <path d="M8 12.4l-3.76 2.27 1.01-4.28L1.5 6.91l4.38-.38L8 2.5l2.12 4.03 4.38.38-3.75 3.48 1.01 4.28L8 12.4z"/>
              </svg>
            </div>
          ))}
        </div>
      </div>
      
    </div>;
};