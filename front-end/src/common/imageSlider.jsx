import { useState } from "react";
import { Dialog } from "@headlessui/react";

const CustomNextArrow = ({ className, onClick }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="black"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      onClick={onClick}
    >
      <path d="M10 6L18 12L10 18"></path>
    </svg>
  );
};

const CustomPrevArrow = ({ className, onClick }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="black"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      onClick={onClick}
    >
      <path d="M14 6L8 12L14 18"></path>
    </svg>
  );
};

const ImageSlider = ({ images }) => {

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const previousButtonClickHandler = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextButtonClickHandler = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="flex flex-row justify-center gap-8  items-center bg-transparent  max-h-screen">
        <CustomNextArrow className="h-10 rounded-full cursor-pointer" onClick={nextButtonClickHandler}>
          Next
        </CustomNextArrow>
        <div className="relative max-h-screen">
          <img
            src={images[currentImageIndex].image_url}
            className="w-full max-h-screen object-cover cursor-pointer"
            alt="images"
            onClick={() => setIsModalOpen(true)}
          />
          <span className="absolute bottom-3 left-1/2 transform -translate-x-1/2 rounded-2xl py-1 px-2 font-bold bg-white/30 backdrop-blur-sm">
            {`${currentImageIndex + 1}/${images.length}`}
          </span>
        </div>
        <CustomPrevArrow className="h-10 rounded-full cursor-pointer" onClick={previousButtonClickHandler}>
          Previous
        </CustomPrevArrow>
      </div>

      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-lg transition-opacity" />
            <div className="transform transition-all sm:max-w-full sm:w-full">
              <div className="relative flex flex-row justify-between items-center p-4">

                <CustomNextArrow className="h-10 rounded-full cursor-pointer" onClick={nextButtonClickHandler}>
                  Next
                </CustomNextArrow>
                <button
                  className="absolute top-2 right-4 text-gray-700 text-2xl rounded-full bg-gray-200 hover:bg-gray-400 font-bold px-4 py-2"
                  onClick={() => setIsModalOpen(false)}
                >
                  &times; {/* Close icon */}
                </button>
                <div className="justify-center items-center">

                  <img
                    src={images[currentImageIndex].image_url}
                    className="w-full h-auto max-h-[80vh] object-contain"
                    alt="images"
                  />
                  <span className="mt-2 font-bold">
                    {`${currentImageIndex + 1}/${images.length}`}
                  </span>
                </div>
                <CustomPrevArrow className="h-10 rounded-full cursor-pointer" onClick={previousButtonClickHandler}>
                  Previous
                </CustomPrevArrow>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};

export default ImageSlider;
