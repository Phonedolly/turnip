import Flex from "@react-css/flex";

import { useState } from "react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";

import "./Art.scss";
import "./Writer.scss";

export default function Writer() {
  const [inputValue, setInputValue] = useState("");
  return (
    <>
      <Flex flexDirection="row">
        <textarea
          classname="inputTextArea"
          value={inputValue}
          onInput={(e) => {
            setInputValue(e.target.value);
          }}
        />
        <div className="showTextArea">
          <ReactMarkDown children={inputValue} remarkPlugins={[remarkGfm]} />
        </div>
      </Flex>
    </>
  );
}
