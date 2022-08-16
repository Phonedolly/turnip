import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import SyntaxHighlighter from "react-syntax-highlighter";

import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { onGetAuth, onSilentRefresh, onLoginSuccess } from "../Util/LoginTools";

// import "./Art.scss";
import "./GitHubMarkdownToMe.scss";

export default function Art(props) {
  const [isLoggedIn, setLoggedIn] = useState("PENDING");
  const params = useParams();
  const [md, setMd] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function setLoginInfo() {
      await onSilentRefresh().then(
        () => {},
        () => {
          setLoggedIn("NO");
          return;
        }
      );
      onGetAuth().then(
        () => {
          setLoggedIn("YES");
          console.log("isLoggedIn" + isLoggedIn);
        },
        () => {
          setLoggedIn("NO");
          console.log("isLoggedIn" + isLoggedIn);
        }
      );
    }
    setLoginInfo();

    axios.get("/api/post/" + params.postURL).then(
      (res) => {
        console.log(res);
        setMd(res.data.content);
      },
      (err) => {
        setMd("ERROR");
      }
    );
  }, [params]);

  return (
    <>
      {isLoggedIn === "YES" && (
        <button
          onClick={() => {
            navigate("/post/" + params.postURL + "/edit");
          }}
        >
          수정하기
        </button>
      )}
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
    </>
  );
}
