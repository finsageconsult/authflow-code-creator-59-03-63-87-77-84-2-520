import React from "react";

export const FounderFeaturedSection: React.FC = () => {
  const mediaLogos = [
    {
      src: "https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/c9e0631a06ebadaaa1080443176bad30158c1f12?placeholderIfAbsent=true",
      alt: "Economic Times logo"
    },
    {
      src: "https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/470c047abb5e5c4e0b494f5b65a86cf47f3e3eef?placeholderIfAbsent=true",
      alt: "Forbes India logo"
    },
    {
      src: "https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/4fb10e5aa7bb4214aa668cc56dfa8f57d70c4447?placeholderIfAbsent=true",
      alt: "MoneyControl logo"
    },
    {
      src: "https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/f5bd7e04ce756af3ed9f491719944b926333d31c?placeholderIfAbsent=true",
      alt: "YourStory logo"
    }
  ];

  return (
    <section className="flex flex-col items-center">
      <h3 className="text-2xl font-bold text-foreground text-center mt-9">Featured On</h3>
      <div className="w-full max-w-[788px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 place-items-center mt-10">
        {mediaLogos.map((logo, index) => (
          <img
            key={index}
            src={logo.src}
            alt={logo.alt}
            loading="lazy"
            className="h-8 sm:h-10 md:h-12 w-auto object-contain"
          />
        ))}
      </div>
    </section>
  );
};

export default FounderFeaturedSection;
