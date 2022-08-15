import "./Header.scss";
import Flex from "@react-css/flex";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { onGetAuth, onSilentRefresh } from "../Util/LoginTools";

export default function Header(props) {
  return (
    <Link id="header" to="/">
      <Flex id="headerText" flexDirection="row" justifyContent="start">
        <div>Stardue</div>
        <div id="underLine" />
        {props.isLoggedIn ? (
          <div>ㅇㅇㅇㅇㅇ</div>
        ) : (
          <Link to="/login">로그인</Link>
        )}
      </Flex>
    </Link>
  );
}
