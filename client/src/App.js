import './App.scss';
import Header from './Components/Header'
import Art from './Components/Art'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Writer from './Components/Writer';
import Curator from './Components/Curator';
import React, { useEffect } from 'react';
import { Login } from './Components/Login';
import axios from 'axios';
import { useCookies } from "react-cookie";
import { onSilentRefresh } from './Util/LoginTools';

const JWT_EXPIRY_TIME = process.env.REACT_APP_JWT_EXPIRY_TIME;

class App extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    onSilentRefresh()
  }

  render() {
    return (
      <div className="App" >
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Curator />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/post/:postURL" element={<Art />}></Route>
            <Route path="/writer" element={<Writer />}></Route>
          </Routes>

        </BrowserRouter>
      </div>)
  }


}

export default App;
