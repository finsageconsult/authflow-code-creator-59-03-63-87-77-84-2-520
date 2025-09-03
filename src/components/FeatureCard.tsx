import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, className = '' }) => {
  return (
    <article className={`flex flex-col items-center gap-5 border bg-card text-card-foreground shadow-[3px_4px_0_0_hsl(var(--foreground))] px-6 py-8 rounded-xl border-border ${className}`}>
      <div className="flex justify-center items-center">{icon}</div>
      <h3 className="text-center text-xl md:text-2xl font-medium leading-snug">{title}</h3>
    </article>
  );
};

export default FeatureCard;
