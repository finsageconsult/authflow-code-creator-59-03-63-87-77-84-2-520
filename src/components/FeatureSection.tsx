import React from 'react';
import FeatureCard from './FeatureCard';

interface FeatureSectionProps {
  className?: string;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({ className = '' }) => {
  const ESGIcon = () => (
    <div className="flex justify-center items-start gap-6">
      <div>
        {/* Decorative ESG globe icon */}
        <svg width="91" height="90" viewBox="0 0 91 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
          <g clipPath="url(#clip0_1_188)">
            <path d="M67.3669 52.3781C67.3669 36.2618 54.3364 23.197 38.2628 23.197C22.1891 23.197 9.1593 36.2618 9.1593 52.3781C9.1593 68.4943 22.1891 81.5591 38.2628 81.5591C54.3364 81.5591 67.3669 68.4943 67.3669 52.3781Z" fill="#97C9E8"/>
            <path d="M38.2628 23.197C36.7693 23.197 35.3019 23.3103 33.8682 23.528C47.8566 25.6525 58.5772 37.7594 58.5772 52.3781C58.5772 66.9961 47.8566 79.1037 33.8682 81.2281C35.3019 81.4458 36.7693 81.5591 38.2628 81.5591C54.3364 81.5591 67.3669 68.4943 67.3669 52.3781C67.3669 36.2618 54.3364 23.197 38.2628 23.197Z" fill="#60B6FF"/>
            <path d="M34.48 34.5376C29.9969 37.3467 26.6344 41.8422 29.1565 46.8993C31.6778 51.9564 37.2822 49.9899 42.4664 49.2875C47.6499 48.585 43.7271 64.599 46.8094 68.5327C49.8918 72.4659 58.5779 64.599 57.7374 59.5418C56.4932 52.0546 56.0565 49.4275 66.144 44.0896L66.1715 44.0799C62.7712 32.5663 52.4791 24.0237 40.0858 23.2554L40.0844 23.2993C40.0844 23.2993 38.9638 31.7279 34.48 34.5376Z" fill="#BAEB6C"/>
            <path d="M56.498 29.6362C56.4994 29.6376 56.5015 29.6391 56.5037 29.6405C56.5015 29.6391 56.5001 29.6376 56.498 29.6362Z" fill="#BAEB6C"/>
            <path d="M18.9289 65.5822C17.5824 63.5291 21.3102 58.6993 22.1513 55.047C22.9918 51.3947 17.9477 51.6756 16.4068 50.4114C14.8653 49.1466 12.7642 43.6686 11.2227 42.4045L10.9762 42.2095C9.802 45.3763 9.1593 48.8013 9.1593 52.378C9.1593 62.0233 13.8271 70.5741 21.0211 75.8874L21.03 75.2756C21.03 75.2756 22.1513 70.4993 18.9289 65.5822Z" fill="#BAEB6C"/>
          </g>
          <defs>
            <clipPath id="clip0_1_188">
              <rect width="90" height="90" fill="white" transform="translate(0.5)"/>
            </clipPath>
          </defs>
        </svg>
      </div>
      <img src="https://api.builder.io/api/v1/image/assets/TEMP/c71632c1002e46750051e7b9ab2d9e92fa698aa2?width=184" alt="Wellness icon" className="w-20 h-20" loading="lazy" />
    </div>
  );

  const BenefitsIcon = () => (
    <img
      src="https://api.builder.io/api/v1/image/assets/TEMP/c1f51c493eba0569ace73caa647890ae980d889e?width=232"
      alt="Employee benefits icon"
      className="w-24 h-24"
      loading="lazy"
    />
  );

  const LoyaltyIcon = () => (
    <img
      src="https://api.builder.io/api/v1/image/assets/TEMP/78e6556a524059e71a960b436fbc0f2993e7f3d6?width=172"
      alt="Employee loyalty icon"
      className="w-24 h-24"
      loading="lazy"
    />
  );

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <FeatureCard icon={<ESGIcon />} title="Align with ESG, DEI & Wellness policies" />
      <FeatureCard icon={<BenefitsIcon />} title="Create low-cost, high-impact employee benefits" />
      <FeatureCard icon={<LoyaltyIcon />} title="Build loyalty with genuine, usable perks" />
    </div>
  );
};

export default FeatureSection;
