import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";

import { onGetAuth, onSilentRefresh, onLoginSuccess } from "../Util/LoginTools";

import "./Art.scss";

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
        className="article"
        children={md}
        remarkPlugins={[remarkGfm]}
      />
    </>
  );
}
