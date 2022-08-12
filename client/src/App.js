import axios from 'axios'
import { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Header from './Components/Header'
import Art from './Components/Art'

function App() {

  return (
    <div className="App">
      <Header />
      <Art />
    </div>
  );
}

export default App;
