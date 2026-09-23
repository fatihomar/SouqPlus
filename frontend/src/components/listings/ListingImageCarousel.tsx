import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Image from 'next/image';

interface ListingImageCarouselProps {
  images: string[];
  title: string;
  className?: string;
  useNextImage?: boolean;
  onImageClick?: (index: number) => void;
}

export default function ListingImageCarousel({ images, title, className = "", useNextImage = true, onImageClick }: ListingImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasImages = images && images.length > 0;
  const showControls = images && images.length > 1;

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (!hasImages) {
    return (
      <div className={`w-full h-full flex items-center justify-center text-slate-300 bg-slate-100 ${className}`}>
        <Eye className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full group overflow-hidden ${className}`} dir="ltr">
      {/* Current Image */}
      <div 
        className="w-full h-full cursor-pointer"
        onClick={() => onImageClick?.(currentIndex)}
      >
        {useNextImage ? (
          <Image 
            src={images[currentIndex]} 
            alt={`${title} - Image ${currentIndex + 1}`} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
          />
        ) : (
          <img 
            src={images[currentIndex]} 
            alt={`${title} - Image ${currentIndex + 1}`} 
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <>
          {/* Left Button */}
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white text-slate-800 rounded-full flex items-center justify-center shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-10 hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {/* Right Button */}
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white text-slate-800 rounded-full flex items-center justify-center shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all z-10 hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10 px-2 pointer-events-none">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all shadow-sm ${
                  idx === currentIndex 
                    ? 'w-4 bg-white' 
                    : 'w-1.5 bg-white/60'
                }`} 
              />
            ))}
          </div>
        </>
      )}

      {/* 1/X Badge (Bottom Right for MyListings compatibility, or Top Right if we want, but screenshot has it at bottom right) */}
      {hasImages && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-md backdrop-blur-sm z-20 flex items-center justify-center pointer-events-none">
          {currentIndex + 1} <span className="opacity-80 mx-0.5">/</span> {images.length}
        </div>
      )}
    </div>
  );
}
