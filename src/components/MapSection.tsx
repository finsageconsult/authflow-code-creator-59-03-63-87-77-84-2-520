import React from 'react';

interface MapSectionProps {
  className?: string;
}

const MapSection: React.FC<MapSectionProps> = ({ className = '' }) => {
  return (
    <aside className={`flex justify-end -mr-6 lg:-mr-8 ${className}`}>
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/ab3969dcadf61fc974de65d5659d20cf96f53a7e?width=1200"
        alt="Global map showing Finsage's reach across India and international markets"
        className="w-full max-w-[700px] h-auto rounded-lg"
        loading="lazy"
      />
    </aside>
  );
};

export default MapSection;
