
import React, { useState } from "react";
import { Zap, Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

function PhotoModalContent({ photos, startIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? photos.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === photos.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  if (!photos || photos.length === 0) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      <DialogClose asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 hover:text-white h-12 w-12"
        >
          <X className="w-6 h-6" />
        </Button>
      </DialogClose>
      <img
        src={photos[currentIndex]}
        alt={`Charger photo ${currentIndex + 1}`}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
      />
      {photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hover:text-white h-12 w-12"
            onClick={goToPrevious}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hover:text-white h-12 w-12"
            onClick={goToNext}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </>
      )}
      <div className="absolute bottom-4 text-white text-sm bg-black/50 px-2 py-1 rounded-md">
        {currentIndex + 1} / {photos.length}
      </div>
    </div>
  );
}

export default function PhotoGallery({ photos, title }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const openModal = (index) => {
    setStartIndex(index);
    setModalOpen(true);
  };
  
  if (!photos || photos.length === 0) {
    return (
      <div className="h-64 md:h-80 bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center rounded-lg overflow-hidden">
        <div className="text-center text-white">
          <Zap className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
        </div>
      </div>
    );
  }

  const imageBaseClasses = "w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity";

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <div className="h-64 md:h-80 w-full relative">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full rounded-lg overflow-hidden">
          {/* Main Photo */}
          <div className="col-span-4 row-span-2 md:col-span-2 md:row-span-2" onClick={() => openModal(0)}>
            <img src={photos[0]} alt={title} className={imageBaseClasses} />
          </div>
          
          {/* Side Photos */}
          {photos.length > 1 && (
            <div className="hidden md:grid col-span-2 row-span-2 grid-cols-2 grid-rows-2 gap-2">
              {photos.slice(1, 5).map((photo, index) => (
                <div key={index} className="relative" onClick={() => openModal(index + 1)}>
                  <img src={photo} alt={title} className={imageBaseClasses} />
                  {index === 3 && photos.length > 5 && (
                    <DialogTrigger asChild>
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
                          <Camera className="w-4 h-4 mr-2" />
                          Show all photos
                        </Button>
                      </div>
                    </DialogTrigger>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile "Show all photos" button */}
        <DialogTrigger asChild>
          <Button variant="outline" className="absolute bottom-4 right-4 md:hidden bg-white/80 backdrop-blur-sm">
            <Camera className="w-4 h-4 mr-2" />
            Show all
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-none w-screen h-screen bg-black/90 p-0 border-0">
        <PhotoModalContent photos={photos} startIndex={startIndex} onClose={() => setModalOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
