import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './App.scss';
import Art from './Components/Art'

import Writer from './Components/Writer';
import Curator from './Components/Curator';
import { Login } from './Components/Login';

function App() {

  // const logout = async () => {
  //   await axios.get('/api/auth/logout');
  //   setLoggedIn(false);
  //   window.location.reload()
  // }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Curator />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/post/:postURL" element={<Art />}></Route>
          <Route path="/post/:postURL/edit" element={<Writer isEdit={true} />} />
          <Route path="/writer" element={<Writer />} ></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
