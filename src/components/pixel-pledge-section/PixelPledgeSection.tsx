import React from 'react';
import { PixelPledgeHero } from './PixelPledgeHero';
import { PixelPledgeFooter } from './PixelPledgeFooter';

export const PixelPledgeSection: React.FC = () => {
  return (
    <main className="flex flex-col items-stretch rounded-[0px_0px_0px_0px] min-h-screen overflow-hidden">
      <PixelPledgeHero />
      <PixelPledgeFooter />
    </main>
  );
};