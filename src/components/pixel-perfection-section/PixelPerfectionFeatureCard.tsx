
import React from 'react';

interface PixelPerfectionFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  className?: string;
}

export const PixelPerfectionFeatureCard: React.FC<PixelPerfectionFeatureCardProps> = ({ icon, title, className = "" }) => {
  return (
    <article 
      className={`flex flex-col items-center gap-[17px] self-stretch px-11 py-[41px] rounded-[33.13px] max-md:px-8 max-md:py-8 max-sm:gap-[15px] max-sm:px-5 max-sm:py-[25px] max-sm:w-full max-sm:h-auto max-sm:min-h-[180px] w-full max-w-[498.61px] h-[244.34px] ${className}`}
      style={{
        background: 'linear-gradient(135deg, #E8F4F1 0%, #D1E7DD 100%)'
      }}
    >
      <div className="flex justify-center items-start gap-[34px] max-sm:gap-5">
        {icon}
      </div>
      <h3 className="text-black text-center text-xl font-normal opacity-80 max-sm:text-base max-sm:leading-[1.3]">
        {title}
      </h3>
    </article>
  );
};

export const PixelPerfectionMultiIconFeatureCard: React.FC<{ icons: React.ReactNode[]; title: string }> = ({ icons, title }) => {
  return (
    <article 
      className="flex flex-col items-center gap-[17px] self-stretch px-11 py-[41px] rounded-[33.13px] max-md:px-8 max-md:py-8 max-sm:gap-[15px] max-sm:px-5 max-sm:py-[25px] max-sm:w-full max-sm:h-auto max-sm:min-h-[180px] w-full max-w-[498.61px] h-[244.34px]"
      style={{
        background: 'linear-gradient(135deg, #E8F4F1 0%, #D1E7DD 100%)'
      }}
    >
      <div className="flex justify-center items-start gap-[34px] max-sm:gap-5">
        {icons.map((icon, index) => (
          <div key={index}>{icon}</div>
        ))}
      </div>
      <h3 className="w-[345px] text-black text-center text-xl font-normal opacity-80 max-sm:w-full max-sm:text-base max-sm:leading-[1.3]">
        <span dangerouslySetInnerHTML={{ __html: title }} />
      </h3>
    </article>
  );
};
