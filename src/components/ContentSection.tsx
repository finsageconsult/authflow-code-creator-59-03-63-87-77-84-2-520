import React from 'react';

export const ContentSection: React.FC = () => {
  return (
    <main className="relative z-10">
      <section
        className="w-[691px] h-60 text-white text-2xl font-normal leading-[1.4] absolute left-[681px] top-[148px] max-md:w-[calc(100%_-_40px)] max-md:text-xl max-md:h-auto max-md:left-5 max-md:top-[720px] max-sm:text-base max-sm:w-[calc(100%_-_32px)] max-sm:left-4 max-sm:top-[590px]"
        aria-labelledby="employee-concerns"
      >
        <p>
          Your employees are doing their best. But behind their smiles are worries:
        </p>
        <ul className="mx-0 my-4" role="list" aria-label="Common employee financial concerns">
          <li className="mx-0 my-2">• Where did my salary go again?</li>
          <li className="mx-0 my-2">• Should I invest or wait?</li>
          <li className="mx-0 my-2">• Will I ever afford a home?</li>
        </ul>
        <p>
          These questions don't stay at home. They walk into meetings, cloud performance, trigger attrition, and impact company culture.
        </p>
      </section>

      <section
        className="w-[691px] h-[220px] text-black text-2xl font-normal leading-[1.4] absolute left-[681px] top-[458px] max-md:w-[calc(100%_-_40px)] max-md:text-xl max-md:h-auto max-md:left-5 max-md:top-[920px] max-sm:text-base max-sm:w-[calc(100%_-_32px)] max-sm:left-4 max-sm:top-[780px]"
        aria-labelledby="finsage-solutions"
      >
        <h3 id="finsage-solutions" className="font-bold mb-4">Finsage fixes this with:</h3>
        <ul className="mx-0 my-4" role="list" aria-label="Finsage solutions">
          <li className="mx-0 my-2">• 1:1 financial coaching as a workplace benefit</li>
          <li className="mx-0 my-2">• Expert-led workshops and tax-saving masterclasses</li>
          <li className="mx-0 my-2">• A self-paced learning hub with simple money tools</li>
        </ul>
        <p className="mt-4">
          When money feels manageable, everything else flows smoother — productivity, retention, and peace.
        </p>
      </section>
    </main>
  );
};