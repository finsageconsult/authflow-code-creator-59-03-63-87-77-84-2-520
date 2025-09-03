import React from 'react';
import Header from './Header';
import HeroContent from './HeroContent';

export const HeroSection = () => {
  return (
    <div className="min-h-screen md:min-h-0 relative w-full">
      <img
        src="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/f848b949fa2f31cb6cc2b1c89db8e1b80333b542?placeholderIfAbsent=true"
        className="absolute h-full w-full object-cover inset-0 md:h-auto md:min-h-full max-md:object-center"
        alt="Background pattern"
      />
      <div className="flex flex-col relative h-[1100px] w-full items-center pt-9 pb-[400px] px-20 md:h-auto md:min-h-fit md:pb-32 max-md:pb-[200px] max-md:px-5 max-md:h-auto">
        <div className="relative flex mb-[-33px] w-[952px] max-w-full flex-col items-stretch max-md:mb-2.5">
          <Header />
          <HeroContent />
        </div>
      </div>
    </div>
  );
};