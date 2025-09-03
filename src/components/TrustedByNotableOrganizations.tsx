import React from 'react';
import { SectionHeader } from './SectionHeader';
import { OrganizationCard } from './OrganizationCard';

// Using your existing partner logos
import webvedaLogo from '@/assets/partners/webveda.png';
import uniathenaLogo from '@/assets/partners/uniathena.png';
import apniKakshaLogo from '@/assets/partners/apni-kaksha.png';
import iimSambalpurLogo from '@/assets/partners/iim-sambalpur.png';
import financeWallahLogo from '@/assets/partners/finance-wallah.png';
import education10xLogo from '@/assets/partners/education-10x.png';

const organizations = [
  {
    id: 'webveda',
    name: 'Webveda',
    logo: webvedaLogo,
    logoAspectRatio: 'aspect-[1.07]',
    logoWidth: 'w-24',
    marginTop: 'mt-[18px]'
  },
  {
    id: 'uniathena',
    name: 'Uniathena',
    logo: uniathenaLogo,
    logoAspectRatio: 'aspect-[1.09]',
    logoWidth: 'w-[105px]',
    marginTop: 'mt-[11px]'
  },
  {
    id: 'apni-kaksha',
    name: 'Apni Kaksha',
    logo: apniKakshaLogo,
    logoAspectRatio: 'aspect-[1.09]',
    logoWidth: 'w-[105px]',
    marginTop: 'mt-[11px]'
  },
  {
    id: 'iim-sambalpur',
    name: 'IIM Sambalpur',
    logo: iimSambalpurLogo,
    logoAspectRatio: 'aspect-[1.12]',
    logoWidth: 'w-[111px]',
    marginTop: 'mt-[9px]'
  },
  {
    id: 'finance-wallah',
    name: 'Finance Wallah',
    logo: financeWallahLogo,
    logoAspectRatio: 'aspect-[1.09]',
    logoWidth: 'w-[105px]',
    marginTop: 'mt-[11px]'
  },
  {
    id: 'education-10x',
    name: 'Education 10x',
    logo: education10xLogo,
    logoAspectRatio: 'aspect-[1.08]',
    logoWidth: 'w-[100px]',
    marginTop: 'mt-[15px]'
  }
];

export const TrustedByNotableOrganizations: React.FC = () => {
  const titleContent = (
    <>
      <span style={{ fontWeight: 400, color: 'rgba(46,114,101,1)' }}>
        Trusted by
      </span>{' '}
      <br />
      <span style={{ fontFamily: 'Lato, -apple-system, Roboto, Helvetica, sans-serif', color: 'rgba(53,115,105,1)' }}>
        Notable Organisations
      </span>
    </>
  );

  return (
    <section
      className="flex max-w-[962px] flex-col items-center text-foreground text-center mx-auto"
      aria-labelledby="trusted-by-heading"
    >
      <SectionHeader
        icon="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/83007f3850cda2a91d1fffef50a58ffe7bd64ca6?placeholderIfAbsent=true"
        iconAlt="Trust indicator icon"
        title={titleContent}
      />

      <div
        className="flex w-full items-center gap-[40px_68px] text-[11px] font-semibold flex-wrap mt-[33px] max-md:max-w-full justify-center"
        role="list"
        aria-label="Trusted organizations"
      >
        {organizations.map((org) => (
          <div key={org.id} role="listitem">
            <OrganizationCard
              logo={org.logo}
              name={org.name}
              logoAspectRatio={org.logoAspectRatio}
              logoWidth={org.logoWidth}
              marginTop={org.marginTop}
            />
          </div>
        ))}
      </div>
    </section>
  );
};