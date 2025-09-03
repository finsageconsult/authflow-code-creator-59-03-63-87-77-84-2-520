
import React from 'react';
import { Helmet } from 'react-helmet';
import { TrustedByNotableOrganizations } from './TrustedByNotableOrganizations';
import { HowItWorksSection } from './HowItWorksSection';
import { TestimonialsSection } from './TestimonialsSection';
import { WhatWeOffer } from './WhatWeOffer';
import { FounderSection } from './founder';
import { HeroSection } from './hero-section';
import { PixelPledgeSection } from './pixel-pledge-section';
import { PixelPerfectionSection } from './pixel-perfection-section';
import { ImpactSection } from './impact-section';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

import './Home.css';

const Home = props => {
  useSmoothScroll();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-center mb-[50px]">
        <HeroSection />
      </div>
      
      <div className="py-16 px-4 max-md:py-12 mb-[50px] smooth-scroll">
        <TrustedByNotableOrganizations />
      </div>
      
      
      <div className="py-20 px-4 flex justify-center max-md:py-16 mb-[50px] smooth-scroll">
        <ImpactSection />
      </div>
      
      <div className="flex justify-center mb-[50px] smooth-scroll">
        <PixelPerfectionSection />
      </div>
      
      <div className="mb-[50px] smooth-scroll">
        <HowItWorksSection />
      </div>
      
      <div className="flex justify-center mb-[50px] smooth-scroll">
        <FounderSection />
      </div>
      
      <div className="py-20 px-4 flex justify-center max-md:py-16 mb-[50px] smooth-scroll">
        <WhatWeOffer />
      </div>
      
      <div className="py-20 px-4 flex justify-center max-md:py-16 mb-[50px] smooth-scroll">
        <TestimonialsSection />
      </div>
      
      <div className="smooth-scroll">
        <PixelPledgeSection />
      </div>
    </div>
  );
};
export default Home;
