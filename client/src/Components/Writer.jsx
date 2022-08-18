import Flex from "@react-css/flex";
import axios from "axios";
import { nanoid } from "nanoid";
import { useEffect } from "react";

import { useState } from "react";
import ReactMarkDown from "react-markdown";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import SyntaxHighlighter from "react-syntax-highlighter";

import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";

import { onGetAuth, onSilentRefresh, onLoginSuccess } from "../Util/LoginTools";

//import "./Art.scss";
import "./Writer.scss";

export default function Writer(props) {
  const [isLoggedIn, setLoggedIn] = useState("PENDING");
  const [_id, set_id] = useState("");
  const [titleValue, setTitleValue] = useState("");
  const [newTitleValue, setNewTitleValue] = useState("");
  const [thumbURL, setThumbURL] = useState("");
  const [md, setMd] = useState("");
  const [images, setImages] = useState([]);
  const navigate = useNavigate();
  const params = useParams();
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
        },
        () => {
          setLoggedIn("NO");
        }
      );
    }

    async function getMd() {
      await axios.get("/api/post/" + params.postURL).then(
        (res) => {
          set_id(res.data._id);
          setTitleValue(res.data.title);
          setNewTitleValue(res.data.title);
          setMd(res.data.content);
          setThumbURL(() => res.data.thumbnailURL);

          res.data.images?.map((eachImage) => {
            const imageData = {
              imageLocation: eachImage.imageLocation,
              imageName: eachImage.imageName,
              isThumb: eachImage.imageLocation === res.data.thumbnailURL,
            };

            setImages((images) => {
              const newCond = images.concat(imageData);
              return newCond;
            });
          });

          /* 썸네일이지만 본문에 쓰이지 않은 이미지를 images에 추가 */
          let thereIsThumbAndMd = false; // 썸네일과 본문에 동시에 쓰인 이미지는 없을 것이다
          res.data.images.forEach((eachImage) => {
            if (eachImage.imageLocation === res.data.thumbnailURL) {
              thereIsThumbAndMd = true; // 썸네일이지만 본문에 쓰인 이미지를 발견했다
            }
          });
          if (!thereIsThumbAndMd) {
            const token = res.data.thumbnailURL.split("/");

            setImages((images) => {
              const newCond = [
                {
                  imageLocation: res.data.thumbnailURL,
                  imageName: token[token.length - 1],
                  isThumb: true,
                },
              ].concat(images);
              return newCond;
            });
          }
        },
        (err) => {
          console.error(err);
        }
      );
    }
    setLoginInfo();
    getMd();
  }, []);
  const handleImageInput = async (e) => {
    const formData = new FormData();
    formData.append("img", e.target.files[0]);

    axios
      .post("/api/publish/uploadImage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(
        (res) => {
          setImages((images) => {
            const newCond = images.concat({
              imageLocation: res.data.imageLocation,
              imageName: res.data.imageName,
              isThumb: images.length === 0 ? true : false,
            });
            if (images.length === 0) {
              setThumbURL(res.data.imageLocation);
            }
            return newCond;
          });
        },
        (err) => {
          alert("이미지 업로드 실패");
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
        setThumbURL(eachImage.imageLocation);
      }
    });
  };

  const handleSetValue = (e) => {
    setMd(e.target.value);
  };

  const handleSetTab = (e) => {
    console.log(e.keyCode);
    if (e.keyCode === 9) {
      e.preventDefault();
      let val = e.target.value;
      let start = e.target.selectionStart;
      let end = e.target.selectionEnd;
      e.target.value = val.substring(0, start) + "\t" + val.substring(end);
      e.target.selectionStart = e.target.selectionEnd = start + 1;
      handleSetValue(e);
      return false; //  prevent focus
    }
  };

  if (isLoggedIn === "NO") {
    return <Navigate replace to="/" />;
  } else if (isLoggedIn === "PENDING") {
    return <div>기다리세요</div>;
  } else {
    return (
      <>
        <Flex column className="container">
          <Flex row justifySpaceBetween>
            <input
              placeholder="제목"
              value={props.isEdit ? newTitleValue : titleValue}
              onInput={(e) => {
                if (props.isEdit) {
                  setNewTitleValue(e.target.value);
                } else {
                  setTitleValue(e.target.value);
                }
              }}
            />
            <button
              onClick={async () => {
                const imageBlacklist = [];
                const imageWhitelist = [];
                images.forEach((eachImage) => {
                  if (
                    !md.includes(eachImage.imageLocation) &&
                    thumbURL !== eachImage.imageLocation
                  ) {
                    imageBlacklist.push({ Key: eachImage.imageName });
                  } else {
                    imageWhitelist.push({
                      imageLocation: eachImage.imageLocation,
                      imageName: eachImage.imageName,
                    });
                  }
                });
                axios
                  .post(`/api/publish/${props.isEdit ? "edit" : ""}`, {
                    _id: _id,
                    title: titleValue,
                    newTitle: props.isEdit ? newTitleValue : null,
                    content: md,
                    thumbnailURL: thumbURL,
                    imageWhitelist: imageWhitelist,
                    imageBlacklist: imageBlacklist,
                  })
                  .then(
                    (res) => {
                      navigate("/");
                    },
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
              // onInput={(e) => {
              //   setMd(e.target.value);
              // }}
              onChange={(e) => handleSetValue(e)}
              onKeyDown={(e) => handleSetTab(e)}
            />
            <div className="showTextArea article">
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
          </Flex>
        </Flex>
      </>
    );
  }
}
