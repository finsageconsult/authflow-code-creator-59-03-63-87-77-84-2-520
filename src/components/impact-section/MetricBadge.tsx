
import React from 'react';

interface MetricBadgeProps {
  icon: string;
  label: string;
  variant?: 'decrease' | 'increase' | 'neutral';
}

const MetricBadge: React.FC<MetricBadgeProps> = ({ icon, label, variant = 'decrease' }) => {
  return (
    <div className="flex justify-center items-center gap-1 bg-[rgba(56,120,109,0.10)] p-[3px] rounded-[30px] transition-all duration-200 hover:bg-[rgba(56,120,109,0.15)]" style={{ width: '68.26px', height: '21.09px' }}>
      <div>
        <div
          dangerouslySetInnerHTML={{
            __html: icon,
          }}
        />
      </div>
      <span className="text-[#2E7265] text-center text-xs font-normal opacity-80">
        {label}
      </span>
    </div>
  );
};

export default MetricBadge;
