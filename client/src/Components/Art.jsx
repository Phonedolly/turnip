import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import { motion } from "framer-motion";

import { Markdown } from "./Markdown";

import { onGetAuth, onSilentRefresh } from "../Util/LoginTools";

import "./Art.scss";
import "./GitHubMarkdownToMe.scss";
import Footer from "./Footer";

export default function Art(props) {
  const [isLoggedIn, setLoggedIn] = useState("PENDING");
  const [md, setMd] = useState(null);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    function getContent() {
      axios.get("/api/post/" + params.postURL).then(
        (res) => {
          setTimeout(() => {
            setMd(res.data.content);
            setTimeout(() => {
              window.scroll({ top: 0 });
            }, 100);
          }, 500);

          document.querySelector("title").innerHTML = res.data.title;
        },
        (err) => {
          setMd("ERROR");
        }
      );
    }

    async function setLoginInfo() {
      onSilentRefresh().then(
        () => {
          onGetAuth().then(
            () => {
              setLoggedIn("YES");
            },
            () => {
              setLoggedIn("NO");
            }
          );
        },
        () => {
          setLoggedIn("NO");
          return;
        }
      );
    }
    getContent();
    setLoginInfo();
  }, [params.postURL]);

  if (md)
    return (
      <>
        <motion.div
          className="markdown-container"
          initial={{ y: window.innerHeight / 2, opacity: 0 }}
          animate={{ y: "0", opacity: 1 }}
          exit={{
            y: window.innerHeight / 2,
            opacity: 0,
          }}
        >
          <Markdown md={md} />
        </motion.div>
        {isLoggedIn === "YES" && (
          <button
            onClick={() => {
              navigate("/post/" + params.postURL + "/edit");
            }}
          >
            수정하기
          </button>
        )}
        <Footer />
      </>
    );
}
