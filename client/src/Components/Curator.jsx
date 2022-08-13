import Flex from "@react-css/flex";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./Curator.scss";

export default function Curator() {
  const [artList, setArtList] = useState([]);
  useEffect(() => {
    axios.get("/api/getArtTitleList").then(
      (res) => {
        console.log(res.data);
        setArtList(res.data);
      },
      (err) => {
        console.error(err.data);
      }
    );
  }, []);
  return (
    <>
      <div className="container">
        {artList.map((each) => {
          console.log(each);
          return <Card title={each} key={each} />;
        })}
      </div>
    </>
  );
}

const Card = (props) => (
  <>
    <Flex column className="box">
      {/* <img src={props.image} className="postThumb"></img> */}
      <div className="postTitle">
        <Link to="/art">
          <h2>{props.title}</h2>
        </Link>
      </div>
    </Flex>
  </>
);
