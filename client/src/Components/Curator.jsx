import axios from "axios";
import { useEffect, useState } from "react";
import Flex from "@react-css/flex";

import { getState, saveState } from "..//Hooks/stateSaver";

import Footer from "./Footer";

import "./Curator.scss";
import { Card } from "./Card";
import { useLocation } from "react-router-dom";

export default function Curator() {
  const [sitemap, setSitemap] = useState([]);
  const [moreSitemapCount, setMoreSitemapCount] = useState(0);
  const [canMoreSitemap, setCanMoreSitemap] = useState(true);
  const { scrollY } = getState("Feed") ?? 0;
  const [fetched, setFetched] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!fetched) {
      axios.get("/api/getSitemap").then((res) => {
        setSitemap(res.data);
        setTimeout(() => {
          setFetched(true);
        }, 400);
        if (scrollY && location.pathname === "/") {
          setTimeout(() => {
            window.scroll({
              behavior: "smooth",
              top: scrollY,
            });
          }, 600);
        }
      });
    }
  }, [scrollY]);

  /* Scroll Restoration */
  /* Source: https://stackoverflow.com/questions/71292957/react-router-v6-preserve-scroll-position */
  useEffect(() => {}, [scrollY]);

  useEffect(() => {
    const save = () => {
      saveState("Feed", { scrollY: window.scrollY });
    };
    setTimeout(() => {
      document.addEventListener("scroll", save);
    }, 2000);

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
