import Flex from "@react-css/flex";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./SearchModal.scss";

export default function SearchModal({ isModalOpen, closeModal }) {
  const [inputText, setInputText] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [searchContent, setSearchContent] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (inputText === "") {
      setIsAvailable(false);
      return;
    }
    axios.post("/api/search", { query: inputText }).then((res) => {
      if (res.data.length === 0) {
        return;
      }
      if (res.data) {
        setIsAvailable(true);
        setSearchContent(res.data);
      }
    });
  }, [inputText]);

  return (
    <>
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className={isModalOpen ? "modal open" : "modal"}
            initial={{
              opacity: 0,
            }}
            animate={{ y: "0", opacity: 1 }}
            exit={{
              opacity: 0,
            }}
            onClick={closeModal}
          >
            <section onClick={(e) => e.stopPropagation()}>
              <header>원하는 제목이나 내용을 입력해보세요</header>
              <input
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                }}
              />
              {isAvailable && (
                <>
                  <p>
                    <strong>해당 게시글의 제목이나 내용</strong>이 입력한 내용을
                    포함하고 있습니다
                  </p>
                  <div className="search-result">
                    {searchContent.map((eachSearchItem) => (
                      <motion.li
                        initial={{
                          y: "-0.5em",
                          opacity: 0,
                        }}
                        animate={{ y: "0", opacity: 1 }}
                        className="search-item"
                        onClick={() => {
                          setIsAvailable(false);
                          setInputText("");
                          closeModal();
                          navigate(`/post/${eachSearchItem.postURL}`);
                        }}
                      >
                        <img src={eachSearchItem.thumbnailURL} />
                        <p>{eachSearchItem.title}</p>
                      </motion.li>
                    ))}
                  </div>
                </>
              )}
              <button onClick={closeModal}>닫기</button>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
