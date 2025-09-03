import React from "react";

export const FounderHeroSection: React.FC = () => {
  return (
    <header className="flex w-full max-w-[1214px] flex-col items-center">
      <img
        src="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/1eb49a5a389ef54227f3833ad16dca441b1e290b?placeholderIfAbsent=true"
        alt="Founder portrait"
        loading="lazy"
        className="aspect-[1.15] object-contain w-20 md:w-[83px]"
      />
      <div className="flex w-[997px] max-w-full flex-col items-stretch text-center mt-3">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground">Meet the Founder</h2>
        <p className="text-lg md:text-xl font-medium text-muted-foreground mt-4">
          Built by the woman behind India's finance revolution
        </p>
      </div>
    </header>
  );
};

export default FounderHeroSection;
