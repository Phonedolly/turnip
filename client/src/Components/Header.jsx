import "./Header.scss";
import Flex from "@react-css/flex";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Header(props) {
  const location = useLocation();
  useEffect(() => {}, []);
  return (
    <Flex
      className={location.pathname === "/" ? "header scroll" : "header"}
      row
      justifySpaceBetween
      alignItems="center"
    >
      <Link to="/" className="header-link">
        <motion.div
          initial={{
            y: window.innerHeight / 2,
            opacity: 0,
          }}
          animate={{ y: "0", opacity: 1 }}
          exit={{
            y: -(window.innerHeight / 2),
            opacity: 0,
          }}
        >
          <Flex flexDirection="row" justifyContent="start" className="icon">
            <div className="headerText">Stardue64</div>
            <div className="underLine" />
          </Flex>
        </motion.div>
      </Link>
      <motion.button
        className="search-icon"
        whileHover={{ scale: 1.3 }}
        whileTap={{ scale: 0.9 }}
      ></motion.button>
    </Flex>
  );
}
