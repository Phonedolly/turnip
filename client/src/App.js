import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { onGetAuth, onSilentRefresh, onLoginSuccess } from './Util/LoginTools';

import './App.scss';
import Header from './Components/Header'
import Art from './Components/Art'

import Writer from './Components/Writer';
import Curator from './Components/Curator';

import { Login } from './Components/Login';
import axios from 'axios';

function App({ history }) {
  const [isLoggedIn, setLoggedIn] = useState("PENDING");

  useEffect(() => {

    async function setLoginInfo() {
      await onSilentRefresh()
      onGetAuth()
        .then(
          () => {
            setLoggedIn("YES");
            console.log("isLoggedIn" + isLoggedIn)
          }
          , () => {
            setLoggedIn("NO")
            console.log('isLoggedIn' + isLoggedIn)
          })
    }
    setLoginInfo();

  }, [])

  const logout = async () => {
    await axios.get('/api/auth/logout');
    setLoggedIn(false);
    window.location.reload()
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Header isLoggedIn={isLoggedIn} />
        {isLoggedIn == "YES" ?
          <>
            <Link to="/writer"><button>글쓰기</button></Link>
            <button onClick={logout}>로그아웃</button>
          </> : <></>}
        <Routes>
          <Route path="/" element={<Curator />}></Route>

          <Route path="/login" element={<Login />}></Route>
          <Route path="/post/:postURL" element={<Art />}>
          </Route>
          <Route path="/post/:postURL/edit" element={<Writer isEdit={true} />} />
          <Route path="/writer" element={<Writer />} ></Route>

        </Routes>

      </BrowserRouter>
    </div>
  );
}

export default App;
