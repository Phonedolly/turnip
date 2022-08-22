import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

import './App.scss';
import Art from './Components/Art'

import Writer from './Components/Writer';
import Curator from './Components/Curator';
import { Login } from './Components/Login';
import AnimatedRoutes from './Components/AnimatedRoutes';
import Header from './Components/Header';

function App() {

  // const logout = async () => {
  //   await axios.get('/api/auth/logout');
  //   setLoggedIn(false);
  //   window.location.reload()
  // }

  return (
    <>
      <div className="App">
        <BrowserRouter>
          <Header />
          <AnimatedRoutes />
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
