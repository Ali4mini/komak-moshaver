import { useState, useEffect } from 'react';
import upArrow from "../assets/upArrow.svg"

const ScrollButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top cordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    isVisible && (
      <div className="fixed bottom-4 right-4 bg-gray-400 text-white rounded-full p-2 cursor-pointer">
        <img src={upArrow} alt='upArrow' width={30} onClick={scrollToTop} />
      </div >
    )
  );
};

export default ScrollButton;
