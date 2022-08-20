import Flex from "@react-css/flex";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./Curator.scss";
import Header from "./Header";
import Footer from "./Footer";
import Nothing from "./nothing.jpg";

export default function Curator() {
  const [sitemap, setSitemap] = useState([]);
  useEffect(() => {
    axios.get("/api/getSitemap").then((res) => {
      setSitemap(res.data);
    });
  }, [sitemap]);

  return (
    <>
      <div className="App">
        <Header />
        <div className="container">
          {sitemap.map((each) => {
            return (
              <Card
                title={each.title}
                image={each.thumbnailURL}
                url={"/post/" + each.postURL}
                postDate={each.postDate}
                key={each.title}
              />
            );
          })}
        </div>
        <Footer />
      </div>
    </>
  );
}

const Card = (props) => (
  <>
    <Flex column className="box">
      <Link to={props.url}>
        <img
          src={props.image ?? Nothing}
          alt="썸네일"
          className="postThumb"
        ></img>
        <h2 className="postTitle">{props.title}</h2>
        <p className="postTitle postDate">{props.postDate}</p>
      </Link>
    </Flex>
  </>
);
