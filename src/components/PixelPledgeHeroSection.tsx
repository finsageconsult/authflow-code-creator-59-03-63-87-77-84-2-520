import React from 'react';
import { PixelPledgeCallToActionButton } from './PixelPledgeCallToActionButton';
import { PixelPledgeFeatureCard } from './PixelPledgeFeatureCard';
export const PixelPledgeHeroSection: React.FC = () => {
  const BlurEllipse = () => <div className="absolute right-[8.297px] top-[49px] w-[533px] h-[521px] rounded-[532.703px] bg-gradient-to-br from-[rgba(53,115,105,0.20)] via-[rgba(53,115,105,0.15)] to-[rgba(255,255,255,0.10)] blur-[25px] pointer-events-none" />;
  return <section className="flex w-full min-h-[900px] flex-col items-start gap-2.5 relative overflow-hidden px-8 md:px-16 lg:px-24 xl:px-32 py-[67px] pb-[120px] max-sm:py-5 max-sm:pb-20">
      <img src="https://api.builder.io/api/v1/image/assets/TEMP/429fdf696ccd86ccb7f3949bfcf1cf922da2c9e1?width=2878" alt="Financial wellness background" className="w-full h-[1200px] absolute object-cover left-0 top-0 max-lg:h-[2800px] max-md:h-[3200px] max-sm:h-[2800px]" />

      <BlurEllipse />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 xl:gap-24 relative z-[1] w-full max-w-[700px] lg:max-w-[800px] xl:max-w-[959.86px] items-center mx-auto">
        {/* Content Column */}
        <div className="flex flex-col items-start gap-6 lg:gap-8 w-[491.44px] max-w-full">
          <div className="flex flex-col items-start gap-6 w-full">
            <h2 className="text-[#49887B] text-xl lg:text-[21px] font-normal">
              Why Finsage?
            </h2>
            <h1 className="text-[#49887B] text-2xl sm:text-3xl lg:text-[38px] font-black leading-tight text-left">
              Because money stress isn't just personal. It shows up at work too.
            </h1>
          </div>
          
          <div className="flex flex-col items-start gap-4 w-full">
            <p className="text-neutral-500 text-base lg:text-[19px] font-medium leading-relaxed">
              Your employees are doing their best. But behind their smiles are worries:
            </p>
            
            <ul className="text-neutral-500 text-base lg:text-[19px] font-medium leading-relaxed pl-4 space-y-2">
              <li>• Where did my salary go again?</li>
              <li>• Should I invest or wait?</li>
              <li>• Will I ever afford a home?</li>
            </ul>
            
            <p className="text-neutral-500 text-base lg:text-[19px] font-medium leading-relaxed">
              These questions don't stay at home. They walk into meetings, cloud performance, trigger attrition, and impact company culture.
            </p>
          </div>
          
          
          <p className="text-black text-base lg:text-[19px] font-semibold">
            When money feels manageable, everything else flows smoother — productivity, retention, and peace.
          </p>
          
          <div className="mt-2">
            <PixelPledgeCallToActionButton text="Learn More about us" />
          </div>
        </div>
        
        {/* Image Column */}
        <div className="flex justify-start items-start">
          <PixelPledgeFeatureCard />
        </div>
      </div>
    </section>;
};