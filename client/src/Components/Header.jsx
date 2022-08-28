import Flex from "@react-css/flex";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import "./Header.scss";

export default function Header(props) {
  const location = useLocation();
  return (
    <div className={location.pathname === "/" ? "header scroll" : "header"}>
      <div className="header-content">
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
          whileHover={{ scale: 1.5 }}
          whileTap={{ scale: 1.0 }}
          onClick={props.openSearchModal}
        ></motion.button>
      </div>
    </div>
  );
}
