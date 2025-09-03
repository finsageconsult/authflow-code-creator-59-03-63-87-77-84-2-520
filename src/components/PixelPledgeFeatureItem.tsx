import React from 'react';

interface PixelPledgeFeatureItemProps {
  icon: React.ReactNode;
  text: string;
}

export const PixelPledgeFeatureItem: React.FC<PixelPledgeFeatureItemProps> = ({ icon, text }) => {
  return (
    <div className="flex items-start gap-[14.291px] relative max-sm:gap-2.5">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="text-[#284C45] text-sm font-medium relative max-sm:text-xs">
        {text}
      </div>
    </div>
  );
};