import React from 'react';
import { TestimonialCard } from './TestimonialCard';
import { StatisticsCard } from './StatisticsCard';
export const TestimonialsSection: React.FC = () => {
  const testimonials = [{
    id: 1,
    quote: '"My coach helped me restructure my salary and save ₹30,000 more every year. That\'s peace of mind."',
    authorName: 'Shreya M.',
    authorTitle: 'Fintech Startup Employee',
    authorImage: 'https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/df963d8a5f97ecd73f0fd215c685222d3bea9124?placeholderIfAbsent=true',
    badgeText: 'Employee Testimonial',
    badgeVariant: 'employee' as const,
    quoteSize: 'sm' as const
  }, {
    id: 2,
    quote: '"We used to get endless salary-related queries. Finsage solved that in just 3 sessions."',
    authorName: 'Shreya M.',
    authorTitle: 'Fintech Startup Employee',
    authorImage: 'https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/3cf037d00b728b6f5567c4c999020d6e678cc399?placeholderIfAbsent=true',
    badgeText: 'HR TESTIMONIAL',
    badgeVariant: 'hr' as const,
    quoteSize: 'md' as const
  }, {
    id: 3,
    quote: '"Finsage helped me shift from salary stress to savings joy — in just two sessions."',
    authorName: 'Shreya M.',
    authorTitle: 'Fintech Startup Employee',
    authorImage: 'https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/647a7b12e380a1b0e51a0d1a1978228237e6a64f?placeholderIfAbsent=true',
    badgeText: 'Employee Testimonial',
    badgeVariant: 'employee' as const,
    quoteSize: 'lg' as const
  }, {
    id: 4,
    quote: '"We used to get endless salary-related queries. Finsage solved that in just 3 sessions."',
    authorName: 'Shreya M.',
    authorTitle: 'Fintech Startup Employee',
    authorImage: 'https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/647a7b12e380a1b0e51a0d1a1978228237e6a64f?placeholderIfAbsent=true',
    badgeText: 'HR TESTIMONIAL',
    badgeVariant: 'hr' as const,
    quoteSize: 'md' as const
  }];
  return <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-stretch">
      <header className="self-center flex w-full max-w-2xl flex-col items-stretch text-center">
        <img src="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/beb65831e7b9ec619510c3be280bddd9b58e7c02?placeholderIfAbsent=true" alt="Finsage Logo" className="aspect-[3.09] object-contain w-32 sm:w-36 lg:w-[147px] self-center" />
        <div className="w-full mt-6">
          <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold leading-tight text-[#357369]">
            Love from Our Clients
          </h1>
          <p className="text-[#2E7265] text-sm sm:text-base font-medium leading-relaxed mt-4 sm:mt-6">
            Discover what our clients have to say about their experiences with us and learn 
            how our services have positively impacted their life
          </p>
        </div>
      </header>

      <div className="w-full mt-8 sm:mt-12 lg:mt-[51px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-[30px]">
          <div className="space-y-4">
            <TestimonialCard {...testimonials[0]} showBadge={true} />
            <TestimonialCard {...testimonials[1]} showBadge={true} />
          </div>

          <div className="flex justify-center lg:justify-start">
            <StatisticsCard backgroundImage="https://api.builder.io/api/v1/image/assets/d591ca4ef2284baeaec9047fb1d46b80/eac8e1c301a88fa964690e150d3669004adcff71?placeholderIfAbsent=true" statNumber="50k+" statDescription="Satisfied client's" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-[30px] mt-6 lg:mt-[26px]">
          <TestimonialCard {...testimonials[2]} />
          <TestimonialCard {...testimonials[3]} />
        </div>
      </div>
    </section>;
};