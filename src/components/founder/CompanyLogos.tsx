import React from 'react';

interface CompanyLogo {
  src: string;
  alt: string;
  className: string;
}

const logos: CompanyLogo[] = [
  {
    src: "https://api.builder.io/api/v1/image/assets/TEMP/15b50bf5136c6caaee80e5a6ef18eb1d99c662d0?width=159",
    alt: "Company logo 1",
    className: "w-20 h-[42px] aspect-[79.64/41.96] relative max-sm:w-[60px] max-sm:h-8"
  },
  {
    src: "https://api.builder.io/api/v1/image/assets/TEMP/02e38bf492fa117921e67c8d5affe983639662c1?width=239",
    alt: "Company logo 2",
    className: "w-[119px] h-[30px] aspect-[4/1] relative max-sm:w-[90px] max-sm:h-[22px]"
  },
  {
    src: "https://api.builder.io/api/v1/image/assets/TEMP/ba030b2cb9ae77434e87b41ef879c437495af8ce?width=252",
    alt: "Company logo 3",
    className: "w-[126px] h-9 aspect-[177/50] relative max-sm:w-[95px] max-sm:h-[27px]"
  },
  {
    src: "https://api.builder.io/api/v1/image/assets/TEMP/a8ef32f968cc403a456be8eac797a016c6f2a637?width=167",
    alt: "Company logo 4",
    className: "w-[83px] h-[37px] aspect-[103/46] relative max-sm:w-[63px] max-sm:h-7"
  }
];

export const CompanyLogos: React.FC = () => {
  return (
    <div className="flex items-center gap-6 relative max-md:flex-wrap max-md:gap-4 max-md:justify-center max-sm:gap-3">
      {logos.map((logo, index) => (
        <img
          key={index}
          src={logo.src}
          alt={logo.alt}
          className={logo.className}
        />
      ))}
    </div>
  );
};