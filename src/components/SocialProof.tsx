import React from 'react';
import { Check } from 'lucide-react';

const SocialProof = () => {
  return (
    <div className="flex w-[280px] flex-col items-start gap-4 relative max-md:w-[250px] max-sm:w-[220px] max-sm:items-center">
      <div className="relative">
        <svg
          width="130"
          height="50"
          viewBox="0 0 130 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[130px] h-[50px] max-sm:w-[100px] max-sm:h-[38px] relative"
        >
          <defs>
            <pattern id="img1" patternContentUnits="objectBoundingBox" width="1" height="1">
              <image href="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid slice"/>
            </pattern>
            <pattern id="img2" patternContentUnits="objectBoundingBox" width="1" height="1">
              <image href="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid slice"/>
            </pattern>
            <pattern id="img3" patternContentUnits="objectBoundingBox" width="1" height="1">
              <image href="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid slice"/>
            </pattern>
          </defs>
          <circle cx="25" cy="25" r="25" fill="url(#img1)" />
          <circle cx="65" cy="25" r="25" fill="url(#img2)" />
          <circle cx="105" cy="25" r="25" fill="url(#img3)" />
        </svg>
      </div>

      <div className="flex h-[43px] items-center gap-[9px] self-stretch relative pl-[15px] pr-2.5 py-0 rounded-[50px]" style={{background: 'linear-gradient(90deg, rgba(100, 134, 126, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)'}}>
        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#64867E]">
          <Check className="w-3 h-3 text-white" />
        </div>
        <div className="w-[327px] h-[33px] text-[#344947] text-[26px] font-manrope relative flex items-center">
          <span className="font-bold">1043+</span>
          <span className="font-normal ml-1 text-sm">people already joined</span>
        </div>
      </div>
    </div>
  );
};

export default SocialProof;