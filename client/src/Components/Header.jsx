import "./Header.scss";
import Flex from "@react-css/flex";

export default function Header() {
  return (
    <a className="header" href="/">
      <Flex className="headerText" flexDirection="row" justifyContent="start">
        <div>Stardue</div>
        <div className="underLine" />
      </Flex>
    </a>
  );
}
