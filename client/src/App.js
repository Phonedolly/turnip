import './App.scss';
import Header from './Components/Header'
import Art from './Components/Art'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Writer from './Components/Writer';
import Curator from './Components/Curator';
import { useEffect, useState } from 'react';
import { Login } from './Components/Login';
import axios, { AxiosRequestConfig } from 'axios';
import { useCookies } from "react-cookie";
import { onGetAuth, onSilentRefresh, onLoginSuccess } from './Util/LoginTools';


const JWT_EXPIRY_TIME = process.env.REACT_APP_JWT_EXPIRY_TIME;

function App({ history }) {
  const [cookies, setCookie, removeCookie] = useCookies([]);
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {

    onSilentRefresh()

    onGetAuth()
      .then(setLoggedIn(true), setLoggedIn(false))
    console.log('직전:' + axios.defaults.headers.common["Authorization"])

  }, [])


  return (
    <div className="App">
      <BrowserRouter>
        <Header isLoggedIn={isLoggedIn} />
        <button onClick={() => {

          onGetAuth().then(() => alert("성공"), () => alert("실패"))
        }} />
        <button onClick={async () => {
          axios.get('/auth/logout')
            .then((res) => {
              console.log(res); setLoggedIn(false)
            }, (err) => console.log(err))



        }} />
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
