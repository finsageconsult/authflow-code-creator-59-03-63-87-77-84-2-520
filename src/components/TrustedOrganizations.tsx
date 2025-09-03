import React from 'react';
import webvedaLogo from '@/assets/partners/webveda.png';
import uniathenaLogo from '@/assets/partners/uniathena.png';
import apniKakshaLogo from '@/assets/partners/apni-kaksha.png';
import iimSambalpurLogo from '@/assets/partners/iim-sambalpur.png';
import financeWallahLogo from '@/assets/partners/finance-wallah.png';
import education10xLogo from '@/assets/partners/education-10x.png';

const TrustedOrganizations = () => {
  const organizations = [
    {
      name: 'Webveda',
      image: webvedaLogo,
    },
    {
      name: 'Uniathena',
      image: uniathenaLogo,
    },
    {
      name: 'Apni Kaksha',
      image: apniKakshaLogo,
    },
    {
      name: 'IIM Sambalpur',
      image: iimSambalpurLogo,
    },
    {
      name: 'Finance Wallah',
      image: financeWallahLogo,
    },
    {
      name: 'Education 10x',
      image: education10xLogo,
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
      <div className="space-y-16">
        {/* Header */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="flex justify-center">
            <svg width="60" height="60" viewBox="0 0 61 61" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
              <path d="M30.5 0L37.8617 18.6383L61 30.5L37.8617 42.3617L30.5 61L23.1383 42.3617L0 30.5L23.1383 18.6383L30.5 0Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Trusted by 25+ Organizations
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Our comprehensive financial guidance platform has empowered thousands of employees across diverse industries
            </p>
          </div>
        </div>
        
        {/* Logo Scrolling Container */}
        <div className="overflow-hidden">
          <div className="flex animate-scroll">
            {/* First set of logos */}
            {organizations.map((org, index) => (
              <div key={`first-${index}`} className="flex-shrink-0 mx-8 lg:mx-12">
                <img
                  src={org.image}
                  alt={`${org.name} logo`}
                  className="h-16 w-auto object-contain opacity-60 grayscale"
                />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {organizations.map((org, index) => (
              <div key={`second-${index}`} className="flex-shrink-0 mx-8 lg:mx-12">
                <img
                  src={org.image}
                  alt={`${org.name} logo`}
                  className="h-16 w-auto object-contain opacity-60 grayscale"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedOrganizations;