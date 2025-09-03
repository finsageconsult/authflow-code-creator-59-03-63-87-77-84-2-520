import React from 'react';

export const BackgroundEffects: React.FC = () => {
  return (
    <div className="w-full h-[2000px] absolute inset-0">
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/ef4c1795218d381465d1f6db4069c93f9b067b2d?width=2876"
        alt=""
        className="w-full h-[2000px] opacity-50 absolute object-cover left-1/2 bottom-0 transform -translate-x-1/2"
      />
      <div>
        <div
          dangerouslySetInnerHTML={{
            __html:
              "<svg id=\"621:5\" width=\"662\" height=\"725\" viewBox=\"0 0 662 725\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" class=\"background-blur\" style=\"width: 609px; height: 616px; transform: rotate(0.344deg); border-radius: 616.212px; background: linear-gradient(227deg, rgba(53, 115, 105, 0.50) 5.27%, rgba(255, 255, 255, 0.00) 119.71%); filter: blur(27px); position: absolute; left: 0; top: 88px\"> <g filter=\"url(#filter0_f_621_5)\"> <ellipse cx=\"304.669\" cy=\"308.106\" rx=\"304.669\" ry=\"308.106\" transform=\"matrix(0.999619 0.0275937 -0.00599958 0.999982 0.311531 46.1538)\" fill=\"url(#paint0_linear_621_5)\"></ellipse> </g> <defs> <filter id=\"filter0_f_621_5\" x=\"-55.5427\" y=\"0.443848\" width=\"717.118\" height=\"724.435\" filterUnits=\"userSpaceOnUse\" color-interpolation-filters=\"sRGB\"> <feFlood flood-opacity=\"0\" result=\"BackgroundImageFix\"></feFlood> <feBlend mode=\"normal\" in=\"SourceGraphic\" in2=\"BackgroundImageFix\" result=\"shape\"></feBlend> <feGaussianBlur stdDeviation=\"27\" result=\"effect1_foregroundBlur_621_5\"></feGaussianBlur> </filter> <linearGradient id=\"paint0_linear_621_5\" x1=\"543.65\" y1=\"-3.9815\" x2=\"-184.546\" y2=\"667.77\" gradientUnits=\"userSpaceOnUse\"> <stop stop-color=\"#357369\" stop-opacity=\"0.5\"></stop> <stop offset=\"1\" stop-color=\"white\" stop-opacity=\"0\"></stop> </linearGradient> </defs> </svg>",
          }}
        />
      </div>
    </div>
  );
};