import React from 'react';
import { ServiceCard } from './ServiceCard';

const services = [
  {
    id: 'financial-coaching',
    icon: `<svg width="29" height="30" viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg" class="leaf-icon" style="width: 29px; height: 29px; flex-shrink: 0"> <path d="M13.5938 3.04688C13.2969 3.11347 13.008 3.21192 12.7322 3.3405C7.91822 5.59042 4.83334 11.8822 4.83334 17.2726C4.83334 22.3959 8.67947 26.6058 13.5938 27.071V3.04688ZM15.4063 27.071C20.3206 26.6058 24.1667 22.3971 24.1667 17.2738C24.1667 16.7824 24.1413 16.2854 24.0906 15.7827L15.4063 24.4682V27.071ZM22.0642 9.20575C21.6006 8.33654 21.0586 7.51145 20.445 6.74075L15.4063 11.7795V15.8637L22.0642 9.20575ZM19.2222 5.3995C18.3558 4.55716 17.358 3.86171 16.2678 3.3405C15.992 3.21192 15.7032 3.11347 15.4063 3.04688V9.21663L19.2222 5.3995ZM22.881 10.9506L15.4063 18.4265V21.9041L23.5625 13.7479L23.722 13.5884C23.5093 12.689 23.2282 11.8071 22.881 10.9506Z" fill="#167869"></path> </svg>`,
    title: 'Financial\nCoaching',
    description: 'Confidential, personalised sessions with certified financial coaches to help employees reduce money stress, plan smarter, and feel confident about their finances.',
    backgroundColor: '#EAFEF4',
    iconBackgroundColor: '#E8E8F4'
  },
  {
    id: 'group-learning',
    icon: `<svg width="29" height="30" viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg" class="presentation-icon" style="width: 29px; height: 29px; flex-shrink: 0"> <path d="M3.625 4.86328H25.375M4.83333 4.86328V16.9466C4.83333 17.5876 5.08795 18.2022 5.54116 18.6555C5.99437 19.1087 6.60906 19.3633 7.25 19.3633H21.75C22.3909 19.3633 23.0056 19.1087 23.4588 18.6555C23.9121 18.2022 24.1667 17.5876 24.1667 16.9466V4.86328M14.5 19.3633V24.1966M10.875 24.1966H18.125" stroke="#631300" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M9.66669 14.5301L13.2917 10.9051L15.7084 13.3218L19.3334 9.69678" stroke="#631300" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </svg>`,
    title: 'Group Learning',
    description: 'Interactive workshops and live webinars on salary structuring, tax planning, Investrment strategies, and building healthy money habits-tailored to your team\'s.',
    backgroundColor: '#FFF6F2',
    iconBackgroundColor: '#FFE1C6'
  },
  {
    id: 'diy-tools',
    icon: `<svg width="19" height="30" viewBox="0 0 19 30" fill="none" xmlns="http://www.w3.org/2000/svg" class="rupee-icon" style="width: 18px; height: 29px; flex-shrink: 0"> <g clip-path="url(#clip0_632_51)"> <path d="M18.1702 5.96729C18.543 5.96729 18.8452 5.66296 18.8452 5.2876V3.02197C18.8452 2.64662 18.543 2.34229 18.1702 2.34229H1.52021C1.14745 2.34229 0.845215 2.64662 0.845215 3.02197V5.55653C0.845215 5.93188 1.14745 6.23621 1.52021 6.23621H6.31721C7.85329 6.23621 9.0319 6.80024 9.74678 7.77979H1.52021C1.14745 7.77979 0.845215 8.08412 0.845215 8.45947V10.7251C0.845215 11.1005 1.14745 11.4048 1.52021 11.4048H10.4503C10.1006 13.4487 8.59624 14.7257 6.24521 14.7257H1.52021C1.14745 14.7257 0.845215 15.0301 0.845215 15.4054V18.4081C0.845215 18.5977 0.923965 18.7788 1.0624 18.9075L10.3466 27.5371C10.4713 27.6529 10.6347 27.7173 10.8044 27.7173H15.4485C16.063 27.7173 16.3578 26.9578 15.9063 26.5381L7.41921 18.6495C11.7223 18.5169 14.7961 15.6251 15.1996 11.4048H18.1702C18.543 11.4048 18.8452 11.1005 18.8452 10.7251V8.45947C18.8452 8.08412 18.543 7.77979 18.1702 7.77979H14.8689C14.6728 7.1261 14.4032 6.51976 14.0672 5.96729H18.1702Z" fill="#186E6C"></path> </g> <defs> <clipPath id="clip0_632_51"> <rect width="18" height="29" fill="white" transform="translate(0.845215 0.529785)"></rect> </clipPath> </defs> </svg>`,
    title: 'DIY Digital Tools',
    description: 'Self-paced resources including budget guides, EMI calculators, tax estimators, and financial planning templates -accesible anytime, anywhere.',
    backgroundColor: '#FFFCF3',
    iconBackgroundColor: '#FFF4DC'
  }
];

export const WhatWeOffer: React.FC = () => {
  const handleGetStarted = (serviceId: string) => {
    console.log(`Getting started with ${serviceId}`);
    // Here you would typically navigate to a specific page or open a modal
    // For now, we'll just log the action
  };

  return (
    <section className="flex w-full max-w-[966px] flex-col items-center gap-[38px] mx-auto my-0 px-5 py-10 max-md:gap-[30px] max-md:px-[15px] max-md:py-[30px] max-sm:gap-6 max-sm:px-2.5 max-sm:py-5">
      <header className="flex w-full max-w-xl flex-col items-center gap-3">
        <div className="w-full max-w-xl h-[49px] relative">
          <h1 className="w-full text-[#357369] text-center text-[38px] font-bold leading-[49px] h-[49px] max-md:text-[32px] max-md:leading-10 max-sm:text-[28px] max-sm:leading-9" role="heading" aria-level={2}>
            What We Offer
          </h1>
        </div>
        <p className="w-full text-[#2E7265] text-center text-sm font-normal leading-[25px] max-md:text-[13px] max-md:leading-[22px] max-sm:text-xs max-sm:leading-5">
          Supportive, personalized financial wellness solutions that meet your team where they are
        </p>
        <p className="w-full text-[#357369] text-center text-xs font-medium italic leading-5 opacity-80">
          Because financial wellness is workplace wellness.
        </p>
      </header>

      <div className="flex items-center gap-9 w-full max-lg:grid max-lg:grid-cols-2 max-lg:gap-6 md:flex md:flex-col md:gap-6 md:items-center lg:flex-row lg:items-center max-sm:gap-5 max-sm:flex max-sm:flex-col max-sm:items-center">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            icon={service.icon}
            title={service.title}
            description={service.description}
            backgroundColor={service.backgroundColor}
            iconBackgroundColor={service.iconBackgroundColor}
            onGetStarted={() => handleGetStarted(service.id)}
          />
        ))}
      </div>
    </section>
  );
};