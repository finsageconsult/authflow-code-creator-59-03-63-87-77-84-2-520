import React from 'react';

export const PixelPerfectionIndiaMapSection: React.FC = () => {
  const handleDemoRequest = () => {
    // This would typically open a form modal or navigate to a demo page
    console.log('Demo requested');
  };

  return (
    <section className="flex w-full flex-col items-center gap-[53px] max-md:w-full max-md:max-w-md max-md:mx-auto max-sm:gap-[30px]">
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/0bb571b825f179d0f517cf5efc2699a42b703373?width=906"
        alt="India map showing pan-India coverage"
        className="w-[453px] h-[531px] max-md:w-full max-md:h-auto max-md:max-w-sm max-md:mx-auto"
      />
      <div className="flex w-[331px] flex-col items-center gap-9 max-md:w-full max-md:max-w-md max-md:mx-auto max-sm:w-full max-sm:gap-[25px]">
        <div className="flex w-[293px] flex-col items-start gap-[21px] max-md:w-full max-md:text-center max-md:items-center max-sm:w-full max-sm:text-center max-sm:items-center">
          <h2 className="w-[225px] h-[27px] text-[#357369] text-xl font-bold max-sm:w-full max-sm:h-auto max-sm:text-lg">
            Pan-India Coverage -
          </h2>
          <p className="h-[60px] self-stretch text-[#357369] text-xl font-bold max-sm:h-auto max-sm:text-lg max-sm:leading-[1.3]">
            Metro &amp; tier - 2 Cities, hybrid &amp; remote teams
          </p>
        </div>
        <button
          onClick={handleDemoRequest}
          className="flex h-[63px] flex-col justify-center items-center gap-2 self-stretch cursor-pointer px-[15px] py-[7px] rounded-[41px] transition-colors max-sm:h-[50px] max-sm:px-2.5 max-sm:py-[5px]"
          style={{
            background: 'linear-gradient(135deg, #7FB3A3 0%, #5F9B8E 100%)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #6FA093 0%, #4F8B7E 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #7FB3A3 0%, #5F9B8E 100%)';
          }}
          aria-label="Request a demo of the India program"
        >
          <span className="flex w-[265px] h-8 flex-col justify-center text-white text-center text-xl font-bold tracking-[0.8px] max-sm:w-full max-sm:h-auto max-sm:text-base">
            See the india program
          </span>
        </button>
      </div>
    </section>
  );
};