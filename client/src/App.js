import axios from 'axios'
import { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Header from './Components/Header'
import Art from './Components/Art'

function App() {
  const callAPI = async () => {
    axios.get('/api').then((res) => console.log(res.data.test))
  };
  useEffect(() => {
    callAPI();
  }, []);

  return (
    <div className="App">
      <Header />
      <Art />
    </div>
  );
}

export default App;
