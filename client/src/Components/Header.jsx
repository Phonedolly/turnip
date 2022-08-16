import "./Header.scss";
import Flex from "@react-css/flex";
import { Link } from "react-router-dom";

export default function Header(props) {
  return (
    <Link id="header" to="/">
      <Flex id="headerText" flexDirection="row" justifyContent="start">
        <div>Stardue</div>
        <div id="underLine" />
      </Flex>
    </Link>
  );
}
