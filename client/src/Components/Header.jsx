import "./Header.scss";
import Flex from "@react-css/flex";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <Link className="header" to="/">
      <Flex className="headerText" flexDirection="row" justifyContent="start">
        <div>Stardue</div>
        <div className="underLine" />
      </Flex>
    </Link>
  );
}
