
import React from 'react';
import { BackgroundEffects } from './BackgroundEffects';
import { FounderContent } from './FounderContent';

export const FounderSection: React.FC = () => {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Lato:wght@400;500;700&family=Manrope:wght@400;700&family=Inter:wght@600;700&display=swap"
      />
      <section className="flex w-full min-h-[800px] flex-col justify-center items-center gap-2.5 relative overflow-hidden pl-8 py-16 max-md:px-6 max-md:py-16 max-sm:px-4 max-sm:py-12">
        <BackgroundEffects />

        <div className="flex items-center justify-center gap-[104px] relative z-[1] w-full max-w-[1200px] mx-auto max-lg:flex-col max-lg:gap-[50px] max-lg:items-center max-md:gap-[40px] max-sm:gap-[30px]">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/437f7bddce08f7d67a5a685804720413dd638f35?width=675"
            alt="CA Rishita - Founder of Finsage"
            className="w-[337px] h-[851px] aspect-[44/111] relative shrink-0 max-lg:w-[280px] max-lg:h-[707px] max-md:w-[250px] max-md:h-[632px] max-sm:w-[200px] max-sm:h-[505px]"
          />

          <FounderContent />
        </div>
      </section>
    </>
  );
};
