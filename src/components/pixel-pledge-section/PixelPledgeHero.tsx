import React, { useState } from 'react';
import { PixelPledgeCTAButton } from './PixelPledgeCTAButton';
export const PixelPledgeHero: React.FC = () => {
  const [isBookingDemo, setIsBookingDemo] = useState(false);
  const [isExploring, setIsExploring] = useState(false);
  const handleBookDemo = () => {
    window.location.href = '/book-demo';
  };
  const handleExplore = () => {
    setIsExploring(true);
    // Simulate exploration process
    setTimeout(() => {
      setIsExploring(false);
      alert('Redirecting to team exploration page...');
    }, 1000);
  };
  return <header className="self-center z-10 flex min-h-[400px] sm:min-h-[480px] lg:min-h-[534px] w-full max-w-[1019px] flex-col items-stretch text-center justify-center px-8 sm:px-12 md:px-20 lg:px-[120px] py-8 sm:py-12 md:py-16 lg:py-[84px] rounded-2xl sm:rounded-3xl lg:rounded-[33px] translate-y-8 sm:translate-y-12 md:translate-y-16 lg:translate-y-24 bg-[#4e8e7f]">
      <div className="flex w-full flex-col items-stretch space-y-6 sm:space-y-8">
        <div className="flex w-full flex-col items-stretch text-white">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[39px] font-bold leading-tight px-2 sm:px-0">
            Bring Finsage to Your Workplace & make financial calm your
            company's new culture.
          </h1>
          <p className="text-sm sm:text-base lg:text-[15px] font-medium leading-relaxed self-center mt-4 sm:mt-5 px-4 sm:px-8 lg:px-0 max-w-2xl">
            Think of it as every employee's personal CA, money mentor, and
            calm button — rolled into one and gives HR a massive sigh of
            relief.
          </p>
        </div>
        <div className="self-center flex w-full max-w-sm sm:max-w-md lg:max-w-[405px] flex-col items-stretch text-lg sm:text-xl text-black font-semibold gap-4 sm:gap-[19px] px-4 sm:px-0">
          <PixelPledgeCTAButton variant="primary" onClick={handleBookDemo} className="self-center w-full sm:w-[358px] max-w-full">
            {isBookingDemo ? 'Booking...' : 'Book a free Discovery Call'}
          </PixelPledgeCTAButton>
          <PixelPledgeCTAButton variant="secondary" onClick={handleExplore} className="w-full">
            {isExploring ? 'Loading...' : 'Explore finsage for your team'}
          </PixelPledgeCTAButton>
        </div>
      </div>
    </header>;
};