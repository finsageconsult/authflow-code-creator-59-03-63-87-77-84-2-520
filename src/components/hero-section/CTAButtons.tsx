
import React, { useState } from 'react';

const CTAButtons = () => {
  const [isBookingDemo, setIsBookingDemo] = useState(false);

  const handleBookDemo = () => {
    window.location.href = '/book-demo';
  };

  const handleSeeHowItWorks = () => {
    // Scroll to demo section or open modal
    console.log('See how it works clicked');
  };

  return (
    <div className="flex w-[300px] max-w-full flex-col items-stretch mt-[37px]">
      <button
        className="flex min-h-[55px] w-full items-center gap-2 text-lg text-white font-medium justify-center px-3.5 py-[17px] rounded-[39px] bg-gradient-to-br from-[#8DB3AB] to-[#597771] hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#8DB3AB] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleBookDemo}
        disabled={isBookingDemo}
        aria-label="Book a demo of our financial wellness platform"
      >
        <span className="self-stretch my-auto">
          {isBookingDemo ? 'Booking...' : 'Book a Demo'}
        </span>
      </button>
      <button
        className="flex items-center gap-[3px] text-[22px] text-[rgba(73,136,123,1)] font-normal mt-3 hover:text-[rgba(63,126,113,1)] transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(73,136,123,1)] focus:ring-offset-2 rounded-md"
        onClick={handleSeeHowItWorks}
        aria-label="See how our platform works"
      >
        <span className="self-stretch w-[170px] my-auto">See how it works</span>
        <img
          src="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/2bbcfdab14aa39ca9218d28728eb8cd7140d70df?placeholderIfAbsent=true"
          className="aspect-[1] object-contain w-4 self-stretch shrink-0 my-auto"
          alt="Arrow icon"
        />
      </button>
    </div>
  );
};

export default CTAButtons;
