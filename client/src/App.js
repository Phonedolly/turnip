import './App.scss';
import Header from './Components/Header'
import Art from './Components/Art'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Writer from './Components/Writer';
import Curator from './Components/Curator';
import { useEffect } from 'react';
import { Login } from './Components/Login';


function App() {
  useEffect(() => {

  })

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
