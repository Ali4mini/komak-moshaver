import Filter from "./filter";
import PkFilter from "./pk_filter";
import File from "./property_card";
import { useEffect, useState } from "react";
import api from "../common/api";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const [files, setFiles] = useState(null);
  useEffect(() => {
    api.get("/").then((response) => {
      setFiles(response.data);
    }).catch((error) => console.log(error));
  }, []);

  return (
    <div className="home flex flex-col gap-3">
      <PkFilter setter={setFiles} />
      <Filter setter={setFiles} />
      <div className="flex flex-col ">
        {files ? (
          files.map((item, index) => <File key={index} file={item} />)
        ) : (
          <p>no files was found</p>
        )}
      </div>
    </div>
  );
};

export default Home;
