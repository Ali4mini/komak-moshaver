import React, { useState } from "react";
import Slider from "react-slick";
import { Dialog } from "@headlessui/react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ImageSlider.css"; // Ensure this file exists for custom styles

const CustomPrevArrow = ({ currentSlide, slideCount, ...props }) => {
  const isDisabled = currentSlide === 0;
  return (
    <svg
      {...props}
      className={`custom-prev-arrow slick-prev ${isDisabled ? 'disabled' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="black"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 6L18 12L10 18"></path>
    </svg>
  );
};

const CustomNextArrow = ({ currentSlide, slideCount, ...props }) => {
  const isDisabled = currentSlide === slideCount - 1;
  return (
    <svg
      {...props}
      className={`custom-next-arrow slick-next ${isDisabled ? 'disabled' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="black"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 6L8 12L14 18"></path>
    </svg>
  );
};

const ImageSliderOld = ({ images }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const settings = {
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "linear",
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    responsive: [
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="image-slider">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div className="flex justify-center items-center" key={index} onClick={() => {
            setCurrentSlide(index);
            setIsModalOpen(true);
          }}>
            <div className="w-full h-full flex justify-center items-center">
              <img src={image.image_url} alt={`Slide ${index}`} className="object-contain px-1.5" />
            </div>
          </div>
        ))}
      </Slider>
      {isModalOpen && (
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="bg-transparent rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <button className="" onClick={() => setCurrentSlide(currentSlide - 1)} disabled={currentSlide === 0}>
                {"<<"}
              </button>
              <img src={images[currentSlide].image_url} alt="Selected" className="slide-image w-full h-auto" />
              <button onClick={() => setCurrentSlide(currentSlide + 1)} disabled={currentSlide === images.length - 1}>
                {">>"}
              </button>
            </div>
          </div>
        </Dialog>
      )
      }
    </div >
  );
};

export default ImageSliderOld;
