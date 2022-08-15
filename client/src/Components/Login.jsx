import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const JWT_EXPIRY_TIME = process.env.REACT_APP_JWT_EXPIRY_TIME;

export const Login = () => {
  const [id, setID] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies([]);

  const onSilentRefresh = () => {
    axios
      .post("/auth/silentRefresh", { refreshToken: cookies.refreshToken })
      .then(onLoginSuccess)
      .catch((error) => {
        console.error(error);
      });
  };

  const onLoginSuccess = (response) => {
    console.log(22);
    const { accessToken, refreshToken } = response.data;

    // accessToken 설정
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    // refreshToken 설정
    setCookie("refreshToken", refreshToken);

    // accessToken 만료하기 1분 전에 로그인 연장
    setTimeout(onSilentRefresh, JWT_EXPIRY_TIME - 60000);
  };

  const onLogin = () => {
    const data = {
      id,
      password,
    };
    axios
      .post("/auth/login", data)
      .then((res) => {
        onLoginSuccess(res);
        navigate("/");
      })
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
      <button onClick={onSilentRefresh} />
    </>
  );
};
