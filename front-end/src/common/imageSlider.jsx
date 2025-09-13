import { useEffect, useState, useCallback } from "react";
import { Dialog } from "@headlessui/react";

// --- SVG Components (Unchanged) ---
const NextIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10 6L18 12L10 18"></path>
  </svg>
);
const PrevIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14 6L8 12L14 18"></path>
  </svg>
);

const ImageSlider = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const previousButtonClickHandler = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const nextButtonClickHandler = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  // KEYBOARD NAV: Add a useEffect to handle key presses when the modal is open.
  useEffect(() => {
    // This function will be the event handler.
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        previousButtonClickHandler();
      } else if (event.key === "ArrowRight") {
        nextButtonClickHandler();
      }
    };

    //
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    // Cleanup function: remove the event listener when the modal closes or the component unmounts.
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, previousButtonClickHandler, nextButtonClickHandler]);

  const handleContainerKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previousButtonClickHandler();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      nextButtonClickHandler();
    }
  };

  return (
    <>
      <div
        className="flex flex-row justify-center gap-4 items-center bg-transparent p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        role="region"
        aria-roledescription="carousel"
        aria-label="Image gallery"
        tabIndex="0"
        onKeyDown={handleContainerKeyDown}
      >
        <button
          onClick={previousButtonClickHandler}
          className="h-10 w-10 p-2 flex items-center justify-center text-black cursor-pointer rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Previous image"
        >
          <NextIcon />
        </button>

        <div className="relative w-full max-w-2xl aspect-video">
          <button
            onClick={() => openModal(currentImageIndex)}
            className="w-full h-full block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
            aria-label={`View image ${currentImageIndex + 1} in a dialog`}
          >
            <img
              src={images[currentImageIndex].image_url}
              alt={images[currentImageIndex].alt_text}
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </button>
          <div
            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 rounded-full py-1 px-3 text-sm font-semibold bg-white/50 backdrop-blur-sm"
            aria-hidden="true"
          >
            {`${currentImageIndex + 1}/${images.length}`}
          </div>
        </div>

        <button
          onClick={nextButtonClickHandler}
          className="h-10 w-10 p-2 flex items-center justify-center text-black cursor-pointer rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Next image"
        >
          <PrevIcon />
        </button>

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Image {currentImageIndex + 1} of {images.length}:{" "}
          {images[currentImageIndex].alt_text}
        </div>
      </div>

      {isModalOpen && (
        <Dialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="fixed z-50 inset-0 overflow-y-auto"
        >
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div
            className="flex items-center justify-center min-h-screen"
            onClick={() => setIsModalOpen(false)}
          >
            <Dialog.Panel
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <Dialog.Title className="sr-only">
                Image viewer: {images[currentImageIndex].alt_text}
              </Dialog.Title>
              <img
                src={images[currentImageIndex].image_url}
                alt={images[currentImageIndex].alt_text}
                className="max-w-[90vw] max-h-[90vh] object-contain"
              />
              <div className="sr-only" aria-live="polite" aria-atomic="true">
                Image {currentImageIndex + 1} of {images.length}
              </div>
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full py-1 px-3 text-white font-semibold bg-black/50"
                aria-hidden="true"
              >
                {`${currentImageIndex + 1}/${images.length}`}
              </div>
              <button
                className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white text-3xl rounded-full bg-black/40 hover:bg-black/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close image viewer"
              >
                <span aria-hidden="true">&times;</span>
              </button>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 p-2 flex items-center justify-center text-white cursor-pointer rounded-full bg-black/40 hover:bg-black/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={previousButtonClickHandler}
                aria-label="Previous image"
              >
                <PrevIcon />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 p-2 flex items-center justify-center text-white cursor-pointer rounded-full bg-black/40 hover:bg-black/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={nextButtonClickHandler}
                aria-label="Next image"
              >
                <NextIcon />
              </button>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default ImageSlider;
