import React from "react";

export const FounderDetailsSection: React.FC = () => {
  const handleMeetRishita = () => {
    // TODO: hook to your contact modal or route
    console.log("Meet Rishita clicked");
  };

  return (
    <section className="relative bg-gradient-to-br from-muted/20 to-background py-16 sm:py-20 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMzU3MzY5IiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="gap-5 flex max-md:flex-col">
          <div className="w-6/12 max-md:w-full">
          <img
            src="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/657fa01a8383fb46e696715d2c05403370db3653?placeholderIfAbsent=true"
            alt="CA Rishita - Founder of Finsage"
            loading="lazy"
            className="aspect-[0.74] object-contain w-full rounded max-md:mt-10"
          />
        </div>
        <div className="w-6/12 max-md:w-full">
          <article className="w-full text-lg md:text-2xl mt-2">
            <div className="text-foreground font-medium">
              <p>
                After the successful launch of Finance100x — India's most loved platform for finance courses — CA Rishita is now redefining how workplaces approach financial wellbeing.
              </p>
              <br />
              <p>
                Rishita has already empowered over <span className="font-bold">100,000 individuals</span> across the country to feel more confident about their money — through simplified education in investing, taxation, financial modeling, and money habits.
              </p>
              <br />
              <p>
                Now, through Finsage, she's helping forward-thinking companies create a culture of financial clarity, care, and confidence at work.
              </p>
              <br />
              <p>
                Finsage brings her decade-long expertise in finance education into a powerful B2B offering — combining engaging webinars, confidential 1:1 coaching, and tangible outcomes.
              </p>
            </div>
            <div className="flex w-full max-w-[360px] items-center gap-6 text-center uppercase tracking-[0.06em] mt-12">
              <button
                onClick={handleMeetRishita}
                className="bg-card text-foreground border border-border px-5 py-2.5 rounded-[calc(var(--radius))] shadow-md hover:shadow-sm transition-all"
                aria-label="Meet Rishita - Contact the founder"
              >
                Meet Rishita →
              </button>
              <a
                href="#"
                aria-label="Connect on social media"
                className="inline-flex items-center hover:opacity-80"
              >
                <img
                  src="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/b026174fe0e37ff1b3458f899d6142f170aab301?placeholderIfAbsent=true"
                  alt="Founder social profile"
                  loading="lazy"
                  className="aspect-square object-contain w-12"
                />
              </a>
            </div>
          </article>
        </div>
        </div>
      </div>
    </section>
  );
};

export default FounderDetailsSection;
