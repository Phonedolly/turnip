import "./Header.scss";
import Flex from "@react-css/flex";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Header(props) {
  return (
    <Link className={props.scroll ? "header scroll" : "header"} to="/">
      <Flex id="headerText" flexDirection="row" justifyContent="start">
        <div>Stardue64</div>
        <div id="underLine" />
      </Flex>
    </Link>
  );
}
