import './App.scss';
import Header from './Components/Header'
import Art from './Components/Art'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Writer from './Components/Writer';
import Curator from './Components/Curator';
import { useEffect } from 'react';
import { Login } from './Components/Login';
import axios from 'axios';
import { useCookies } from "react-cookie";

const JWT_EXPIRY_TIME = process.env.REACT_APP_JWT_EXPIRY_TIME;

function App() {
  const [cookies, setCookie, removeCookie] = useCookies([]);

  const onSlientRefresh = () => {
    console.log(cookies);
    axios
      .post("/api/silentRefresh", { refreshToken: cookies.refreshToken })
      .then(onLoginSuccess)
      .catch((error) => { });
  };

  const onLoginSuccess = (response) => {
    console.log(response.data);
    const { accessToken, refreshToken } = response.data;

    // accessToken 설정
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    console.log(refreshToken);

    // refreshToken 설정
    setCookie("refreshToken", refreshToken);
    console.log(refreshToken);

    // accessToken 만료하기 1분 전에 로그인 연장
    setTimeout(onSlientRefresh, JWT_EXPIRY_TIME - 60000);
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Curator />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/post/:postURL" element={<Art />}></Route>
          <Route path="/writer" element={<Writer />}></Route>
        </Routes>

      </BrowserRouter>
    </div>
  );
}

export default App;
