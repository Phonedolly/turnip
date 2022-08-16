import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { onGetAuth, onSilentRefresh, onLoginSuccess } from './Util/LoginTools';

import './App.scss';
import Header from './Components/Header'
import Art from './Components/Art'

import Writer from './Components/Writer';
import Curator from './Components/Curator';

import { Login } from './Components/Login';
import axios from 'axios';




const JWT_EXPIRY_TIME = process.env.REACT_APP_JWT_EXPIRY_TIME;

function App({ history }) {
  const [isLoggedIn, setLoggedIn] = useState(false);


  useEffect(() => {

    async function setLoginInfo() {
      await onSilentRefresh()
      onGetAuth()
        .then(
          () => {
            setLoggedIn(true);
            console.log("isLoggedIn" + isLoggedIn)
          }
          , () => {
            setLoggedIn(false)
            console.log('isLoggedIn' + isLoggedIn)
          })
    }
    setLoginInfo();

  }, [])

  const logout = async () => {
    await axios.get('/auth/logout');
    setLoggedIn(false);
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Header isLoggedIn={isLoggedIn} />
        {isLoggedIn ?
          <>
            <Link to="/writer"><button>글쓰기</button></Link>
            <button onClick={logout}>로그아웃</button>
          </> : <></>}
        <Routes>
          <Route path="/" element={<Curator />}></Route>

          <Route path="/login" element={<Login isLoggedIn={isLoggedIn} />}></Route>
          <Route path="/post/:postURL" element={<Art isLoggedIn={isLoggedIn} />}>
          </Route>
          <Route path="/post/:postURL/edit" element={<Writer isLoggedIn={isLoggedIn} isEdit={true} />} />
          <Route path="/writer" element={<Writer isLoggedIn={isLoggedIn} />} ></Route>

        </Routes>

      </BrowserRouter>
    </div>
  );
}

export default App;
