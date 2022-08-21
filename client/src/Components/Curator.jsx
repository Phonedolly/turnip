import Flex from "@react-css/flex";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getState, saveState } from "./stateSaver";

import "./Curator.scss";
import Header from "./Header";
import Footer from "./Footer";
import Nothing from "./nothing.jpg";

export default function Curator() {
  const [sitemap, setSitemap] = useState([]);
  const [moreSitemapCount, setMoreSitemapCount] = useState(0);
  const [canMoreSitemap, setCanMoreSitemap] = useState(true);
  const { scrollY } = getState("Feed") ?? 0;

  useEffect(() => {
    axios.get("/api/getSitemap").then((res) => {
      setSitemap(res.data);
    });
  }, []);

  /* Scroll Restoration */
  /* Source: https://stackoverflow.com/questions/71292957/react-router-v6-preserve-scroll-position */
  useEffect(() => {
    if (scrollY) {
      setTimeout(() => {
        window.scrollTo(0, scrollY);
      }, 100);
    }
  }, [scrollY]);

  useEffect(() => {
    const save = () => {
      saveState("Feed", { scrollY: window.pageYOffset });
    };

    save();

    document.addEventListener("scroll", save);

    return () => document.removeEventListener("scroll", save);
  }, []);

  const handleMorePosts = () => {
    if (!canMoreSitemap) {
      return;
    }
    axios.get("/api/getSitemap/more/" + moreSitemapCount).then(
      (res) => {
        const morePosts = res.data.morePosts;
        setMoreSitemapCount(() => moreSitemapCount + 1);
        setSitemap((prev) => {
          return prev.concat(morePosts);
        });
        if (res.data.canMoreSitemap === false) {
          setCanMoreSitemap(() => false);
        }
      },
      () => {
        alert("데이터 로드 실패");
      }
    );
  };

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
        {canMoreSitemap && (
          <Flex column>
            <button className="moreButton" onClick={handleMorePosts}>
              더보기
            </button>
          </Flex>
        )}
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
