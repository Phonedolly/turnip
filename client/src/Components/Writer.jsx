import Flex from "@react-css/flex";
import axios from "axios";
import { nanoid } from "nanoid";
import { useEffect } from "react";

import { useState } from "react";
import ReactMarkDown from "react-markdown";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { onGetAuth, onSilentRefresh, onLoginSuccess } from "../Util/LoginTools";

import "./Art.scss";
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
          console.log("isLoggedIn" + isLoggedIn);
        },
        () => {
          setLoggedIn("NO");
          console.log("isLoggedIn" + isLoggedIn);
        }
      );
    }

    async function getMd() {
      await axios.get("/api/post/" + params.postURL).then(
        (res) => {
          console.log(res);
          set_id(res.data._id);
          setTitleValue(res.data.title);
          setNewTitleValue(res.data.title);
          setMd(res.data.content);
          setThumbURL(() => res.data.thumbnailURL);

          res.data.images?.map((eachImage) => {
            console.log("eachImage.imagelocation:" + eachImage.imageLocation);
            console.log("res.data.thumb:" + res.data.thumbnailURL);

            const imageData = {
              imageLocation: eachImage.imageLocation,
              imageName: eachImage.imageName,
              isThumb: eachImage.imageLocation === res.data.thumbnailURL,
            };
            // console.log(imageData);
            // console.log(images);

            setImages((images) => {
              const newCond = images.concat(imageData);
              return newCond;
            });
          });

          /* 썸네일이지만 본문에 쓰이지 않은 이미지를 images에 추가 */
          let thereIsThumbAndMd = false; // 썸네일과 본문에 동시에 쓰인 이미지는 없을 것이다
          res.data.images.forEach((eachImage) => {
            if (eachImage.imageLocation === res.data.thumbnailURL) {
              thereIsThumbAndMd = true; // 그런 이미지를 발견했다
              console.log("발견");
            }
          });
          if (thereIsThumbAndMd === false) {
            console.log("thumbURL:" + thumbURL);
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
          console.log(err);
          console.log("이미지 업로드 실패");
          alert("이미지 업로드 실패");
        }
      );
    console.log(images);
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
    // console.log(images);
  };
  if (isLoggedIn === "NO") {
    return <Navigate replace to="/" />;
  } else if (isLoggedIn === "PENDING") {
    return <div>기다리세요</div>;
  } else {
    return (
      <>
        <Flex column>
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
                  console.log("md:" + md.includes(" "));
                  console.log(md.includes(eachImage.imageLocation));
                  if (
                    !md?.includes(eachImage.imageLocation) &&
                    !thumbURL === eachImage.imageLocation
                  ) {
                    console.log(eachImage.imageLocation + ": 포함 안됨");
                    imageBlacklist.push({ Key: eachImage.imageName });
                  } else {
                    console.log(eachImage.imageLocation + "포함됨");
                    imageWhitelist.push({
                      imageLocation: eachImage.imageLocation,
                      imageName: eachImage.imageName,
                    });
                  }
                });
                console.log(imageBlacklist);
                console.log(imageWhitelist);
                console.log(
                  "uplodURL:" + `/api/publish/${props.isEdit ? "edit" : ""}`
                );
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
                      console.log("포스트 업로드 완료");
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
              onInput={(e) => {
                setMd(e.target.value);
              }}
            />
            <div className="showTextArea article">
              <ReactMarkDown
                children={md ? md : "내용을 입력하세요"}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              />
            </div>
          </Flex>
        </Flex>
      </>
    );
  }
}
