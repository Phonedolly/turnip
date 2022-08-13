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
    const image = e.target.files[0];
    const formData = new FormData();
    formData.append("file", image);

    const res = await axios.post("/api/uploadImage", formData);
    console.log(res);
  };

  // const handleImageInput = async (e) => {
  //   console.log(e.target.files[0]);
  //   const file = e.target.files[0];

  //   s3.upload({
  //     params: {
  //       Bucket: bucket,
  //       Key: file.name + "_" + Date.now() + ".png",
  //       Body: file,
  //     },
  //   }).promise();

  //   s3.then(
  //     (res) => {
  //       console.log(res);
  //       console.log("업로드 성공!");
  //     },
  //     (err) => {
  //       console.error(err);
  //       console.error("image 업로드 실패");
  //     }
  //   );
  // };

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
