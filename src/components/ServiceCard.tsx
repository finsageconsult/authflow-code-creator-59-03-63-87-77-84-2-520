import React from 'react';

interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  backgroundColor: string;
  iconBackgroundColor: string;
  onGetStarted?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  backgroundColor,
  iconBackgroundColor,
  onGetStarted
}) => {
  return (
    <article
      className="flex w-[298px] h-[449px] items-center gap-2.5 flex-1 px-9 py-[31px] rounded-[33px] max-md:w-full max-md:max-w-[400px] max-md:h-auto max-md:min-h-[400px] max-md:p-[30px] max-sm:w-full max-sm:max-w-full max-sm:min-h-[350px] max-sm:p-6"
      style={{ backgroundColor }}
    >
      <div className="flex w-full flex-col items-center gap-2.5 shrink-0">
        <div
          className="flex w-[58px] h-[58px] items-center justify-center gap-2.5 p-3.5 rounded-[29px] max-sm:w-[50px] max-sm:h-[50px] max-sm:p-3"
          style={{ backgroundColor: iconBackgroundColor }}
        >
          <div dangerouslySetInnerHTML={{ __html: icon }} />
        </div>

        <div className="flex flex-col items-center gap-[27px] w-full">
          <div className="flex w-full max-w-48 flex-col items-center gap-5">
            <h3 className="text-[#357369] text-center text-3xl font-bold leading-[35.3px] max-md:text-[26px] max-md:leading-[30px] max-sm:text-2xl max-sm:leading-7">
              {title}
            </h3>
            <p className="w-full max-w-48 text-neutral-500 text-center text-xs font-normal leading-[23px] max-md:text-[11px] max-md:leading-5 max-sm:text-[10px] max-sm:leading-[18px]">
              {description}
            </p>
          </div>

          <div className="flex w-full">
            <button
              className="flex h-[43px] flex-col justify-center items-center gap-[5.65px] w-full cursor-pointer transition-all duration-[0.2s] ease-[ease] px-[10.17px] py-[4.52px] rounded-[28.25px] max-sm:h-[38px] max-sm:px-2 max-sm:py-1 bg-[#357369] hover:bg-[#2E7265] focus:outline-none focus:ring-2 focus:ring-[#357369] focus:ring-opacity-50"
              onClick={onGetStarted}
              aria-label={`Get started with ${title}`}
            >
              <span className="w-[180.8px] h-[22px] text-white text-center text-sm font-bold tracking-[0.542px] max-sm:text-xs max-sm:w-full">
                Get Started →
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};