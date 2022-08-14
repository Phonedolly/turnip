import Flex from "@react-css/flex";
import axios from "axios";
import { nanoid } from "nanoid";

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
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  const handleImageInput = async (e) => {
    console.log(111);
    const formData = new FormData();
    formData.append("img", e.target.files[0]);

    axios
      .post("/api/uploadImage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(
        (res) => {
          setImages((images) => {
            const newCond = images.concat({
              imageLocation: res.data.imageLocation,
              isThumb: images.length === 0 ? true : false,
            });
            if (images.length === 0) {
              setThumbURL(res.data.imageLocation);
            }
            return newCond;
          });
          console.log(images);
        },
        (err) => {
          console.log(err);
          console.log("이미지 업로드 실패");
        }
      );
  };

  const handleThumb = (e) => {
    const srcUrl = e.target.src;
    images.forEach((eachImage, n) => {
      if (eachImage.isThumb) {
        setImages((original) => {
          const newCond = [].concat(original);
          newCond[n].isThumb = false;
          return newCond;
        });
      }
      if (eachImage.imageLocation === srcUrl) {
        setImages((original) => {
          const newCond = [].concat(original);
          newCond[n].isThumb = true;
          return newCond;
        });
      }
    });
    console.log(images);
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
          value={thumbURL}
          onInput={(e) => {
            setThumbURL(e.target.value);
          }}
        />
        <div>
          <div className="imageGroup">
            {images.map((eachImage) => (
              <Flex column key={nanoid()} className="uploadedImageBox">
                <img
                  src={eachImage.imageLocation}
                  className="uploadedImage"
                  alt={eachImage.imageLocation}
                  onClick={handleThumb}
                />
                <pre disabled>{eachImage.imageLocation}</pre>
                {eachImage.isThumb && <p>대표</p>}
              </Flex>
            ))}
          </div>
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
