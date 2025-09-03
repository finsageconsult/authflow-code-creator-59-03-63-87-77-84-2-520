import React from 'react';

interface OrganizationCardProps {
  logo: string;
  name: string;
  logoAspectRatio?: string;
  logoWidth?: string;
  marginTop?: string;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  logo,
  name,
  logoAspectRatio = "aspect-[1.09]",
  logoWidth = "w-[105px]",
  marginTop = "mt-[11px]"
}) => {
  return (
    <figure className="self-stretch whitespace-nowrap grow shrink my-auto">
      <img
        src={logo}
        alt={`${name} logo`}
        className={`${logoAspectRatio} object-contain ${logoWidth}`}
      />
      <figcaption className={`${marginTop} text-[11px] font-semibold text-foreground`}>
        {name}
      </figcaption>
    </figure>
  );
};