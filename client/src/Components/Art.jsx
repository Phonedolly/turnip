import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import SyntaxHighlighter from "react-syntax-highlighter";

import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { onGetAuth, onSilentRefresh } from "../Util/LoginTools";

// import "./Art.scss";
import "./GitHubMarkdownToMe.scss";
import Header from "./Header";
import Footer from "./Footer";

export default function Art(props) {
  const [isLoggedIn, setLoggedIn] = useState("PENDING");
  const params = useParams();
  const [md, setMd] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    function getContent() {
      axios.get("/api/post/" + params.postURL).then(
        (res) => {
          setMd(res.data.content);
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

  return (
    <>
      <Header />
      <div className="App">
        <div className="markdown-container">
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
        </div>
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
      </div>
    </>
  );
}
