import "./Header.scss";
import Flex from "@react-css/flex";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Header(props) {
  const location = useLocation();
  useEffect(() => {}, []);
  return (
    <Link
      className={location.pathname === "/" ? "header scroll" : "header"}
      to="/"
    >
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
        <Flex id="headerText" flexDirection="row" justifyContent="start">
          <div>Stardue64</div>
          <div id="underLine" />
        </Flex>
      </motion.div>
    </Link>
  );
}
