import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import SyntaxHighlighter from "react-syntax-highlighter";
import { motion } from "framer-motion";

import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";
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
          <ReactMarkDown
            className="markdown-body"
            children={md}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    language={match[1]}
                    PreTag="div"
                    {...props}
                    style={github}
                    showLineNumbers={true}
                    wrapLongLines={true}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          />
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
