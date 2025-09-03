import React from 'react';
import MetricBadge from './MetricBadge';

interface ImpactCardProps {
  icon: string;
  title: string;
  description: string;
  metricIcon: string;
  metricLabel: string;
  metricVariant?: 'decrease' | 'increase' | 'neutral';
}

const ImpactCard: React.FC<ImpactCardProps> = ({
  icon,
  title,
  description,
  metricIcon,
  metricLabel,
  metricVariant = 'decrease'
}) => {
  return (
    <article className="flex w-[241px] min-h-[339px] items-center relative px-6 py-[33px] rounded-[33px] max-md:w-[220px] max-md:px-5 max-md:py-[30px] max-sm:w-full max-sm:max-w-[280px] max-sm:min-h-[300px] max-sm:px-5 max-sm:py-[25px]">
      <div className="absolute w-full h-full rounded-[33px] left-0 top-0 bg-[#E8F4F2]" />

      <div className="flex flex-col items-center gap-[22px] relative z-[1] w-full">
        <div>
          <div
            dangerouslySetInnerHTML={{
              __html: icon,
            }}
          />
        </div>

        <div className="flex flex-col items-center gap-[18px] w-full">
          <header className="flex flex-col items-center gap-[9px] w-full">
            <h3 className="text-black text-center text-[17px] font-medium opacity-80 max-sm:text-base">
              {title}
            </h3>
            <p className="text-[#2E7265] text-center text-[13px] font-medium w-full max-sm:text-xs">
              {description}
            </p>
          </header>

          <MetricBadge
            icon={metricIcon}
            label={metricLabel}
            variant={metricVariant}
          />
        </div>
      </div>
    </article>
  );
};

export default ImpactCard;
