import axios from "axios";
import { useState } from "react";

const JWT_EXPIRY_TIME = process.env.REACT_APP_JWT_EXPIRY_TIME;

const onSlientRefresh = (data) => {
  axios
    .post("/api/silent_refresh", data)
    .then(onLoginSuccess)
    .catch((error) => {});
};

const onLoginSuccess = (response) => {
  const { accessToken } = response.data;

  // accessToken 설정
  axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

  // accessToken 만료하기 1분 전에 로그인 연장
  setTimeout(onSlientRefresh, JWT_EXPIRY_TIME - 60000);
};

export const Login = () => {
  const [id, setID] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = () => {
    const data = {
      id,
      password,
    };
    axios
      .post("/api/login", data)
      .then(onLoginSuccess)
      .catch((error) => {});
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
    </>
  );
};

export const requestLogin = async (id, password) => {};
