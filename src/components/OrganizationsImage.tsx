import React from 'react';

interface OrganizationsImageProps {
  className?: string;
}

export const OrganizationsImage: React.FC<OrganizationsImageProps> = ({
  className = ""
}) => {
  return (
    <figure className={className}>
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/8b9b0e3d766e431016792ba558007a09ae3e1a03?width=2467"
        alt="Logos of notable organizations that trust our services"
        className="flex w-full max-w-[1233px] items-center object-contain max-sm:w-full"
        loading="lazy"
      />
    </figure>
  );
};