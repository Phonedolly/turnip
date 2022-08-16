import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createBrowserHistory } from "history";
import { useCookies } from "react-cookie";
import { onSilentRefresh, onLoginSuccess, onGetAuth } from "../Util/LoginTools";
import { useEffect } from "react";

export const Login = (props) => {
  const [isLoggedIn, setLoggedIn] = useState("PENDING");
  const [id, setID] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function setLoginInfo() {
      await onSilentRefresh();
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
    setLoginInfo();
  }, []);

  const onLogin = () => {
    const data = {
      id,
      password,
    };
    axios.post("/auth/login", data).then(
      (res) => {
        onLoginSuccess(res);
        navigate("/");
        navigate(0);
      },
      (err) => {
        alert("로그인 정보가 맞지 않습니다.");
        console.log(err);
      }
    );
  };
  if (isLoggedIn === "YES") {
    return <>이미 로그인되어 있습니다</>;
  }
  return (
    <>
      <input
        placeholder="ID"
        type="text"
        name="username"
        onChange={(e) => setID(e.target.value)}
        required
      ></input>
      <input
        placeholder="Password"
        type="password"
        name="password"
        onChange={(e) => setPassword(e.target.value)}
        required
      ></input>
      <button onClick={onLogin} />
      <button onClick={onSilentRefresh} />
      <button onClick={onGetAuth} />
    </>
  );
};
