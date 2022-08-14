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
  const [thumbURL, setThumbURL] = useState("");
  const [md, setMd] = useState("");
  const navigate = useNavigate();

  const handleImageInput = async (e) => {
    console.log(111);
    const formData = new FormData();
    formData.append("img", e.target.files[0]);

    // fetch("/api/uploadImage", {
    //   method: "POST",
    //   body: formData,
    //   redirect: "follow",
    //   headers: { "Content-Type": "multipart/form-data" },
    // })
    //   .then((response) => response.text())
    //   .then((result) => console.log(result));

    axios
      .post("/api/uploadImage", formData, {
        // redirect: "follow",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // transformRequest: (data, headers) => {
        //   return formData;
        // },
      })
      .then(
        (res) => {
          console.log(res);
          console.log("이미지 업로드 성공!!");
        },
        (err) => {
          console.log(err);
          console.log("이미지 업로드 실패");
        }
      );
  };

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
                .post("/api/publish", {
                  title: titleValue,
                  content: md,
                  thumbnailURL: thumbURL,
                })
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
        <textarea
          placeholder="썸네일 URL"
          className="inputThumbnailArea"
          valud={thumbURL}
          onInput={(e) => {
            setThumbURL(e.target.value);
          }}
        />
        <div>
          <img src={thumbURL}></img>
        </div>
        <input type="file" accept="image/*" onChange={handleImageInput} />
        <Flex flexDirection="row">
          <textarea
            placeholder="내용을 입력하세요"
            className="inputTextArea"
            value={md}
            onInput={(e) => {
              setMd(e.target.value);
            }}
          />
          <div className="showTextArea">
            <ReactMarkDown
              children={md ? md : "내용을 입력하세요"}
              remarkPlugins={[remarkGfm]}
            />
          </div>
        </Flex>
      </Flex>
    </>
  );
}
