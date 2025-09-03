
import React from 'react';

const ExperienceSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
      <div className="text-center space-y-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/e9d9adec-7d6e-4793-a443-13173bf84f37.png"
              alt="Handshake icon"
              className="w-20 h-20 object-contain"
            />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              You've never experienced online finance advisory like this in India
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vulputate nibh et sapien sollicitudin tincidunt.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
