import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { onSilentRefresh, onLoginSuccess, onGetAuth } from "../Util/LoginTools";
import { useEffect } from "react";

export const Login = () => {
  const [id, setID] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies([]);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [s, setS] = useState("");

  useEffect(() => {
    console.log(window.location.href);
    onSilentRefresh();
    onGetAuth().then(
      () => {
        setLoggedIn(true);
      },
      () => {
        setLoggedIn(false);
      }
    );
  }, [s]);
  const onLogin = () => {
    const data = {
      id,
      password,
    };
    axios
      .post("/auth/login", data)
      .then((res) => {
        onLoginSuccess(res);
        //navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
  };

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

      {isLoggedIn ? (
        <div>dd</div>
      ) : (
        <>
          <Link to="/login">로그인</Link>
          <div>
            <input
              type="text"
              onChange={(e) => {
                setS((ss) => ss + e.target.value);
              }}
            />
          </div>
        </>
      )}
    </>
  );
};
