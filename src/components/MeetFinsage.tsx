import React from 'react';
const MeetFinsage = () => {
  return <section className="relative w-full min-h-[800px] overflow-hidden">
      {/* Green Background Shape */}
      <div className="absolute inset-0">
        <svg width="100%" height="100%" viewBox="0 0 1512 793" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0 0H1512V713.572C1512 713.572 806 790.653 733.5 792.961C661 795.269 0 695.11 0 695.11V0Z" fill="#14BA8C" />
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 pb-0">
        <div className="grid lg:grid-cols-2 gap-16 items-start min-h-[600px]">
          {/* Left Content - Text and Team Photo */}
          <div className="space-y-8">
            <div className="space-y-8 text-white">
              <p className="text-xl lg:text-2xl font-medium opacity-90">
                Meet Finsage
              </p>
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-black leading-tight">
                Your Virtual Finance Advisory Team
              </h2>
            </div>
            <div className="flex justify-start lg:justify-start">
              <div className="relative">
                <img src="/lovable-uploads/26b44992-28e8-4df1-8daa-3562092e709a.png" alt="Finance Advisory Team" className="relative w-full max-w-md h-auto object-cover" />
              </div>
            </div>
          </div>

          {/* Right Content - Text and Button */}
          <div className="space-y-8 text-white">
            
            {/* Main Description */}
            <div className="space-y-6">
              <p className="text-lg lg:text-xl leading-relaxed opacity-90">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vulputate nibh et sapien sollicitudin tincidunt. Nunc odio velit, dignissim auctor nulla et, venenatis varius est. Nulla at iaculis purus, nec aliquet urna. Pellentesque varius augue hendrerit, dictum nisi ut, commodo nibh. Quisque bibendum lectus vitae mauris tempor euismod. Ut malesuada feugiat sapien. Etiam faucibus quam eu rhoncus fermentum. Pellentesque maximus mi et felis tempus luctus. Donec vitae orci rutrum, rhoncus massa sit amet, ornare nisl.
              </p>
              
              {/* Result Section */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">
                  Result?
                </h3>
                <p className="text-lg leading-relaxed opacity-90">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vulputate nibh et sapien sollicitudin tincidunt.
                </p>
              </div>
            </div>
            
            {/* Learn More Button */}
            <div className="pt-8">
              <button className="bg-yellow-400 text-black text-lg font-bold px-8 py-4 rounded-lg hover:bg-yellow-300 transition-colors border-2 border-black shadow-lg">
                LEARN MORE ABOUT US
              </button>
              
              {/* Decorative Arrow */}
              <div className="mt-4">
                <img src="/lovable-uploads/d92d1bf5-3218-4db0-8fc0-d7ff1c291254.png" alt="Decorative arrow" className="w-36 h-26 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default MeetFinsage;