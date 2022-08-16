import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";

import "./Art.scss";

export default function Art(props) {
  const params = useParams();
  const [md, setMd] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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
      {props.isLoggedIn && (
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
