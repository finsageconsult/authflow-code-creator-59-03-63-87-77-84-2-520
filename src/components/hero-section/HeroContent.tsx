import React from 'react';
import TrustIndicator from './TrustIndicator';
import CTAButtons from './CTAButtons';

const HeroContent = () => {
  return <main className="flex items-center gap-[40px] mt-[76px] max-md:flex-col max-md:gap-[30px] max-md:max-w-full max-md:mt-10 overflow-hidden">
      <section className="flex-1 flex flex-col">
        <div className="w-full text-[rgba(73,136,123,1)]">
            <h1 className="font-lato font-black text-[24px] sm:text-[28px] md:text-[32px] lg:text-[35px] xl:text-[38px] border-[rgba(73,136,123,1)] leading-auto line-clamp-2 text-[rgba(73,136,123,1)] lg:w-[408.53px]" role="banner" aria-level={1}>
              Financial Wellness for Teams That Care
            </h1>
          <p className="font-manrope text-[16px] sm:text-[17px] md:text-[18px] lg:text-[19px] xl:text-[19.72px] font-medium mt-[17px] leading-relaxed w-full sm:w-full md:w-[350px] lg:w-[376.83px]">
            Give your employees the tools to stress less, save more, and live better
          </p>
          <p className="font-manrope text-[14px] sm:text-[15px] md:text-[16px] font-semibold mt-[8px] text-primary/80 italic leading-relaxed">
            Financial wellness is workplace wellness.
          </p>
        </div>
        <TrustIndicator />
        <CTAButtons />
      </section>
      <aside className="flex-1 max-w-[500px] md:flex-[1.5] md:max-w-none lg:flex-1 lg:max-w-[400px]">
        <img src="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/c331b6d3203c9a5f93b08e90e304c83825b27b72?placeholderIfAbsent=true" className="aspect-[0.95] object-contain w-full rounded-[32px]" alt="Financial wellness platform dashboard showing various features and analytics" />
      </aside>
    </main>;
};

export default HeroContent;