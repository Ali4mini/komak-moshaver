import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./ImageSlider.css"; // Create this file for custom styles

const CustomPrevArrow = ({ currentSlide, slideCount, ...props }) => {
  // You can use currentSlide and slideCount here to conditionally apply styles or classes
  // For example, disable the arrow if it's the first slide
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
  // You can use currentSlide and slideCount here to conditionally apply styles or classes
  // For example, disable the arrow if it's the last slide
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

const ImageSlider = ({ images }) => {
  const settings = {
    dots: true,
    infinite: false,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    cssEase: "linear",
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
  };

  return (
    <div className="image-slider">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index}>
            <img src={image.image_url} alt={`Slide ${index}`} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ImageSlider;
