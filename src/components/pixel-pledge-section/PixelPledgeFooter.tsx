import React from 'react';
import { PixelPledgeSocialLinks } from './PixelPledgeSocialLinks';
const navigationLinks = ['About Finsage', 'For Employers', 'For Individuals', 'Careers', 'Resources/blog'];
const footerLinks = [{
  text: 'Privacy policy',
  url: '#'
}, {
  text: 'Terms of use',
  url: '#'
}, {
  text: 'Contact us',
  url: 'mailto:support@finsage.co'
}];
export const PixelPledgeFooter: React.FC = () => {
  return <footer className="w-full pt-[80px] pb-6 sm:pt-[100px] sm:pb-8 lg:pt-[150px] lg:pb-0 relative triangle-footer overflow-hidden bg-[#2a625d] min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]">
      <div className="w-full px-8 sm:px-12 lg:px-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8 px-4 lg:px-8">
          {/* Logo and Description Section */}
          <div className="lg:col-span-6">
            <div className="flex flex-col text-white">
              <img src="/lovable-uploads/5aa4a0f9-a120-4a04-8379-6fb013388429.png" alt="Finsage logo" className="w-[214px] max-w-full h-auto object-contain" />
              <div className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl font-medium tracking-wide">
                <div className="text-lg sm:text-xl">
                  Financial wellness for modern workplaces
                </div>
                <div className="mt-4 text-sm sm:text-base">
                  Less money stress, more focus
                </div>
              </div>
              <address className="mt-8 sm:mt-12 lg:mt-[70px] not-italic">
                <div className="font-bold text-lg sm:text-xl mb-4">
                  CONTACT
                </div>
                <a href="mailto:support@finsage.co" className="text-sm sm:text-base hover:underline transition-all duration-200">
                  Email - support@finsage.co
                </a>
              </address>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="lg:col-span-3">
            <nav className="text-white text-xs sm:text-sm font-semibold uppercase space-y-3 sm:space-y-4 lg:mt-[74px]">
              {navigationLinks.map((link, index) => <div key={index}>
                  <a href="#" className="hover:text-gray-300 transition-colors duration-200 block">
                    {link}
                  </a>
                </div>)}
            </nav>
          </div>

          {/* Social Links Section */}
          <div className="lg:col-span-3">
            <PixelPledgeSocialLinks />
          </div>
        </div>

        {/* Footer Bottom Section */}
        <hr className="w-full h-0.5 mt-12 sm:mt-16 lg:mt-[76px] border-white border-solid" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-white mt-6 sm:mt-8 px-4 lg:px-8">
          <div className="order-2 sm:order-1">
            Finsage.co © 2025
          </div>
          <div className="order-1 sm:order-2 flex flex-wrap justify-center gap-4 sm:gap-6">
            {footerLinks.map((link, index) => <a key={index} href={link.url} className="underline hover:no-underline transition-all duration-200">
                {link.text}
              </a>)}
          </div>
          <div className="order-3 text-center sm:text-right">
            Design & Develop by
          </div>
        </div>
      </div>
    </footer>;
};