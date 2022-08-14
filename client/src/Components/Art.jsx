import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import React from "react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";

import "./Art.scss";

export default function Art() {
  const params = useParams();
  const [md, setMd] = useState(null);

  useEffect(() => {
    axios.get("/api/post/" + params.postURL).then(
      (res) => {
        console.log(res);
        setMd(res.data[0].content);
      },
      (err) => {
        setMd("ERROR");
      }
    );
  }, [params]);

  return (
    <>
      <ReactMarkDown
        className="article"
        children={md}
        remarkPlugins={[remarkGfm]}
      />
    </>
  );
}
