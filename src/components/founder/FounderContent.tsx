import React from 'react';
import { CompanyLogos } from './CompanyLogos';
import { SocialButton } from './SocialButton';

export const FounderContent: React.FC = () => {
  const handleMeetRishita = () => {
    // This could open a modal, navigate to a contact form, or trigger a demo request
    console.log('Meet Rishita button clicked');
  };

  const handleLinkedInClick = () => {
    // This could open Rishita's LinkedIn profile
    window.open('https://linkedin.com/in/rishita', '_blank');
  };

  return (
    <div className="flex w-[521px] flex-col items-start gap-[43px] relative max-md:w-full max-md:max-w-[600px] max-sm:gap-[30px]">
      <div className="flex flex-col items-start gap-11 self-stretch relative max-sm:gap-[30px]">
        <div className="flex flex-col items-start gap-[17px] self-stretch relative max-sm:gap-[15px]">
          <header className="flex flex-col justify-center items-start gap-[24.09px] self-stretch relative max-sm:gap-[15px]">
            <h1 className="self-stretch relative font-bold text-[40px] text-[rgba(53,115,105,1)] max-md:text-[32px] max-sm:text-[28px]">
              Meet the Founder
            </h1>
            <h2 className="h-[52px] self-stretch relative font-normal text-[17px] text-[rgba(46,114,101,1)] max-md:text-base max-sm:text-[15px]">
              CA Rishita - Leading India's Workplace Finance Revolution
            </h2>
          </header>

          <article className="h-[429px] self-stretch relative max-sm:h-auto">
            <div className="space-y-4">
              <p className="font-normal text-lg text-neutral-500 max-md:text-base max-sm:text-[15px]">
                After the successful launch of Finance100x — India's most loved platform for finance courses — CA Rishita is now redefining how workplaces approach financial wellbeing.
              </p>

              <p className="font-normal text-lg text-neutral-500 max-md:text-base max-sm:text-[15px]">
                Rishita has already empowered over{' '}
                <span className="font-bold">100,000 individuals</span>{' '}
                across the country to feel more confident about their money — through simplified education in investing, taxation, financial modeling, and money habits.
              </p>

              <p className="font-normal text-lg text-neutral-500 max-md:text-base max-sm:text-[15px]">
                Now, through Finsage, she's helping forward-thinking companies create a culture of financial clarity, care, and confidence at work.
              </p>

              <p className="font-normal text-lg text-neutral-500 max-md:text-base max-sm:text-[15px]">
                Finsage brings her decade-long expertise in finance education into a powerful B2B offering — combining engaging webinars, confidential 1:1 coaching, and tangible outcomes.
              </p>
            </div>
          </article>
        </div>

        <CompanyLogos />
      </div>

      <div className="flex items-center gap-[35px] relative w-full max-md:justify-center max-md:gap-[25px] max-sm:flex-row max-sm:gap-3 max-sm:items-center max-sm:justify-center">
        <button
          onClick={handleMeetRishita}
          className="flex w-[331px] h-[63px] flex-col justify-center items-center gap-[8.283px] relative cursor-pointer px-[14.909px] py-[6.626px] rounded-[41.413px] max-sm:w-[250px] max-sm:h-[55px] bg-gradient-to-r from-[hsl(var(--gradient-green-start))] to-[hsl(var(--gradient-green-end))] hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[hsl(var(--gradient-green-start))] focus:ring-offset-2"
          aria-label="Request a demo to meet Rishita"
        >
          <div className="flex h-[27px] items-center gap-[12.424px] shrink-0 relative">
            <div className="flex w-[265px] h-8 flex-col justify-center text-center relative max-sm:w-[220px]">
              <span className="font-bold text-xl text-white tracking-[0.795px] max-sm:text-lg">
                Meet Rishita →
              </span>
            </div>
          </div>
        </button>

        <div className="max-sm:scale-75">
          <SocialButton
            platform="linkedin"
            onClick={handleLinkedInClick}
          />
        </div>
      </div>
    </div>
  );
};