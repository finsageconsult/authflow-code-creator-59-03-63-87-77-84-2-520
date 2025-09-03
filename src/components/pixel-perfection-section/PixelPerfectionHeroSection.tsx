import React from 'react';

export const PixelPerfectionHeroSection: React.FC = () => {
  return (
    <header className="flex w-[826px] flex-col items-center gap-[9px] max-md:w-full max-md:max-w-[700px] max-sm:gap-[15px]">
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/bc3b851abb64b9a6019ca3030038ed304a1fc772?width=138"
        alt="Finsage Logo"
        className="w-[69px] h-[60px] max-sm:w-[50px] max-sm:h-[43px]"
      />
      <div className="flex flex-col items-center gap-6 self-stretch">
        <h1 className="self-stretch text-[#357369] text-center text-[40px] font-bold max-md:text-[32px] max-sm:text-2xl">
          <span>
            Built for India.
            <br />
            Aligned with Global Goals
          </span>
        </h1>
        <p className="w-[572px] h-[51px] text-[#2E7265] text-center text-[17px] font-normal max-md:w-full max-md:max-w-[500px] max-md:text-base max-sm:text-sm max-sm:h-auto">
          Whether you're a global firm with Indian teams or a homegrown
          startup that cares deeply — Finsage fits right in
        </p>
      </div>
    </header>
  );
};