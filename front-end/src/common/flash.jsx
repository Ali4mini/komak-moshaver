import { useDispatch, useSelector } from "react-redux";
import { clearFlashMessage } from "./flashSlice";
import { useEffect, useState } from "react";

const ShowFlashMessage = ({ type, message }) => {
  console.log(message);
  const dispatch = useDispatch();
  const [flashMessage, setFlashMessage] = useState(true);
  console.log(flashMessage);
  useEffect(() => {
    const timer = setTimeout(() => {
      setFlashMessage(false);
      dispatch(clearFlashMessage());
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (flashMessage) {
    return(
      <div className="">
        {message}
      </div>
    )
  }
};

export default ShowFlashMessage;
