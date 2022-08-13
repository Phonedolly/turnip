import Flex from "@react-css/flex";
import axios from "axios";

import { useState } from "react";
import ReactMarkDown from "react-markdown";
import { useNavigate } from "react-router-dom";
import remarkGfm from "remark-gfm";

import "./Art.scss";
import "./Writer.scss";

export default function Writer() {
  const [titleValue, setTitleValue] = useState("");
  const [mdValue, setMdValue] = useState("");
  const navigate = useNavigate();
  return (
    <>
      <Flex column>
        <Flex row justifySpaceBetween>
          <input
            placeholder="제목"
            value={titleValue}
            onInput={(e) => {
              setTitleValue(e.target.value);
            }}
          />
          <button
            onClick={async () => {
              axios
                .post("/api/publish", { title: titleValue, content: mdValue })
                .then(
                  (res) => {},
                  (err) => {
                    console.error(err);
                    console.error("ERROR");
                  }
                );
            }}
          >
            업로드
          </button>
        </Flex>

        <Flex flexDirection="row">
          <textarea
            className="inputTextArea"
            value={mdValue}
            onInput={(e) => {
              setMdValue(e.target.value);
            }}
          />
          <div className="showTextArea">
            <ReactMarkDown children={mdValue} remarkPlugins={[remarkGfm]} />
          </div>
        </Flex>
      </Flex>
    </>
  );
}
