import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { onGetAuth, onSilentRefresh, onLoginSuccess } from './Util/LoginTools';

import './App.scss';
import Header from './Components/Header'
import Art from './Components/Art'

import Writer from './Components/Writer';
import Curator from './Components/Curator';
import { Login } from './Components/Login';
import NotFound from './Components/NotFound';

import axios from 'axios';
import Footer from './Components/Footer';


function App() {
  const [isLoggedIn, setLoggedIn] = useState("PENDING");

  useEffect(() => {

    async function setLoginInfo() {
      await onSilentRefresh()
      onGetAuth()
        .then(
          () => {
            setLoggedIn("YES");
          }
          , () => {
            setLoggedIn("NO")
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
    <>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Curator />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/post/:postURL" element={<Art />}></Route>
            <Route path="/post/:postURL/edit" element={<Writer isEdit={true} />} />
            <Route path="/writer" element={<Writer />} ></Route>
          </Routes>
        </BrowserRouter>
      </div>
      <BrowserRouter>
        <Routes>

        </Routes>
      </BrowserRouter>
    </>

  );
}

export default App;
