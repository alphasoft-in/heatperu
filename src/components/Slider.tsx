import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const slides = [
  { id: 1, imageUrl: '/sliders/slide_wayne.png', alt: 'Wayne' },
  { id: 2, imageUrl: '/sliders/slide_becket.png', alt: 'Becket' },
  { id: 3, imageUrl: '/sliders/slide_honeywell.png', alt: 'Honeywell' },
  { id: 4, imageUrl: '/sliders/slide_mcdonell.png', alt: 'McDonnell' },
  { id: 5, imageUrl: '/sliders/slide_siemens.png', alt: 'Siemens' },
  { id: 6, imageUrl: '/sliders/slide_belgas.png', alt: 'Belgas' },
  { id: 7, imageUrl: '/sliders/slide_armstrong.png', alt: 'Armstrong' },
  { id: 8, imageUrl: '/sliders/slide_vmv.png', alt: 'VMV' },
  { id: 9, imageUrl: '/sliders/slide_baite.png', alt: 'Baite' },
  { id: 10, imageUrl: '/sliders/slide_united.png', alt: 'United Brass' }
];

export default function Slider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  // Autoplay functionality
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000); // Cambia de slide cada 5 segundos
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <div className="w-full bg-white relative group border-b border-gray-100 pb-4 md:pb-8">
      <div className="max-w-[1400px] mx-auto h-[200px] sm:h-[300px] md:h-[450px] lg:h-[550px] relative flex items-center justify-center overflow-hidden">
        
        {/* Contenedor de la Imagen */}
        <div className="w-full h-full px-10 md:px-24 py-4 md:py-8 bg-white flex items-center justify-center">
          <img src={slides[currentIndex].imageUrl} alt={slides[currentIndex].alt} fetchPriority="high" className="w-full h-full object-contain transition-opacity duration-500" />
        </div>

        {/* Left Arrow */}
        <button 
          onClick={prevSlide}
          className="absolute top-1/2 -translate-y-1/2 left-2 md:left-8 text-[#f04f23] hover:bg-orange-50 p-2 rounded-full transition-colors z-10 cursor-pointer"
          aria-label="Anterior"
        >
          <FiChevronLeft className="w-10 h-10 md:w-12 md:h-12" strokeWidth={1.5} />
        </button>

        {/* Right Arrow */}
        <button 
          onClick={nextSlide}
          className="absolute top-1/2 -translate-y-1/2 right-2 md:right-8 text-[#f04f23] hover:bg-orange-50 p-2 rounded-full transition-colors z-10 cursor-pointer"
          aria-label="Siguiente"
        >
          <FiChevronRight className="w-10 h-10 md:w-12 md:h-12" strokeWidth={1.5} />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center items-center pb-2 md:pb-4 gap-2 md:gap-2.5">
        {slides.map((slide, slideIndex) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(slideIndex)}
            aria-label={`Ir al slide ${slideIndex + 1}`}
            className="flex items-center justify-center cursor-pointer focus:outline-none p-1.5 group"
          >
            <div className={`transition-all duration-300 rounded-full ${
              currentIndex === slideIndex 
                ? 'bg-[#f04f23] w-6 md:w-8 h-1.5 md:h-2 scale-100' 
                : 'bg-gray-300 group-hover:bg-gray-400 w-1.5 h-1.5 md:w-2 md:h-2'
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
}
