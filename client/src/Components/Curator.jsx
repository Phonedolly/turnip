import Flex from "@react-css/flex";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./Curator.scss";
import Nothing from "./nothing.jpg";

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
          return (
            <Card
              title={each.title}
              image={each.thumbnailURL}
              key={each.title}
            />
          );
        })}
      </div>
    </>
  );
}

const Card = (props) => (
  <>
    <Flex column className="box">
      <Link to="/art">
        <img src={props.image ?? Nothing} className="postThumb"></img>

        <h2 className="postTitle">{props.title}</h2>
      </Link>
    </Flex>

    {/* <Flex column className="box">
      <Link to="/art">
        <div className="postThumb">
          <img src={props.image ?? Nothing}></img>
        </div>
        <div className="postTitle">
          <h2>{props.title}</h2>
        </div>
      </Link>
    </Flex> */}
  </>
);
