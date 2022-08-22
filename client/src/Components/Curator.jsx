import Flex from "@react-css/flex";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { getState, saveState } from "./stateSaver";

import Footer from "./Footer";
import Nothing from "./nothing.jpg";

import "./Curator.scss";

export default function Curator() {
  const [sitemap, setSitemap] = useState([]);
  const [moreSitemapCount, setMoreSitemapCount] = useState(0);
  const [canMoreSitemap, setCanMoreSitemap] = useState(true);
  const { scrollY } = getState("Feed") ?? 0;
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    axios.get("/api/getSitemap").then((res) => {
      setSitemap(res.data);

      setTimeout(() => {
        setFetched(true);
      }, 500);
    });
  }, []);

  useEffect(() => {
    function setScroll() {
      setTimeout(() => {
        window.scroll({
          behavior: "smooth",
          top: scrollY,
        });
      }, 50);
    }
    if (scrollY && fetched) {
      // setScroll();
    }
  }, [fetched, scrollY]);

  useEffect(() => {}, [sitemap]);

  /* Scroll Restoration */
  /* Source: https://stackoverflow.com/questions/71292957/react-router-v6-preserve-scroll-position */
  useEffect(() => {}, [scrollY]);

  useEffect(() => {
    const save = () => {
      saveState("Feed", { scrollY: window.scrollY });
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

  if (fetched) {
    return (
      <>
        <div className="curator-container">
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
      </>
    );
  }
}

const Card = (props) => (
  <>
    <motion.div
      className="box"
      initial={{
        y: window.innerHeight / 2,
        opacity: 0,
      }}
      animate={{ y: "0", opacity: 1 }}
      exit={{
        y: window.innerHeight / 2,
        opacity: 0,
      }}
      whileHover={{ scale: 1.05 }}
    >
      <Flex column>
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
    </motion.div>
  </>
);
