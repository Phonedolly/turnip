import axios from 'axios'
import { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Header from './Components/Header'
import Art from './Components/Art'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Writer from './Components/Writer';

function App() {

  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Link to="/writer">go to writer</Link>
        <Routes>
          <Route path="/" element={<Art />}></Route>

          <Route path="/writer" element={<Writer />}></Route>
        </Routes>

      </BrowserRouter>
    </div>
  );
}

export default App;
