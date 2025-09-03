import React from 'react';

interface SectionHeaderProps {
  icon?: string;
  iconAlt?: string;
  title: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  iconAlt = "",
  title,
  className = ""
}) => {
  return (
    <header className={`flex flex-col items-center text-center ${className}`}>
      {icon && (
        <img
          src={icon}
          alt={iconAlt}
          className="aspect-[1] object-contain w-16"
        />
      )}
      <div className="w-[655px] max-w-full text-[37px] font-bold mt-[33px] max-md:text-[28px] max-md:mt-6 max-sm:text-[24px] max-sm:mt-4">
        <div className="max-md:max-w-full max-md:px-4 max-sm:px-2">
          {title}
        </div>
      </div>
    </header>
  );
};