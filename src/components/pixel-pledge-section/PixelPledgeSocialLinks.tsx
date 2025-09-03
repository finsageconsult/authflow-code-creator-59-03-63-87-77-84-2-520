import React from 'react';

interface SocialLink {
  name: string;
  icon: string;
  url: string;
}

const socialLinks: SocialLink[] = [
  {
    name: 'Instagram',
    icon: 'https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/76a777b08d9eabf5f6fef477a041430cb58f9edb?placeholderIfAbsent=true',
    url: '#'
  },
  {
    name: 'LinkedIn',
    icon: 'https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/b4e24fdcd6b1b437805d7133ad896b7c4324f161?placeholderIfAbsent=true',
    url: '#'
  },
  {
    name: 'Email',
    icon: 'https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/3efc577fd2054dd82abd75af781639610e884b51?placeholderIfAbsent=true',
    url: 'mailto:support@finsage.co'
  }
];

export const PixelPledgeSocialLinks: React.FC = () => {
  return (
    <div className="flex w-full flex-col mt-[70px] max-md:mt-10">
      <div className="text-white text-sm font-black leading-[52px] tracking-[0.56px] uppercase">
        Follow us on
        <br />
      </div>
      <div className="flex gap-[26px] mt-[51px] max-md:mt-10">
        {socialLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target={link.name === 'Email' ? '_self' : '_blank'}
            rel="noopener noreferrer"
            className="transition-transform duration-200 hover:scale-110"
          >
            <img
              src={link.icon}
              alt={link.name}
              className={`object-contain shrink-0 ${
                index === 0 ? 'aspect-[1] w-[22px]' :
                index === 1 ? 'aspect-[1] w-6 self-stretch' :
                'aspect-[1.04] w-6'
              }`}
            />
          </a>
        ))}
      </div>
    </div>
  );
};