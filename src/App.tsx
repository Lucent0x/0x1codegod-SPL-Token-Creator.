import React from 'react';
import './App.css';
import FungibleToken from './components/fungibleToken';
import FungibleTokenV2 from './components/token-with-metadata';
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Solana Play Ground</h1>
        <div>
      <FungibleToken />
      <FungibleTokenV2/>
      </div>
      </header>
    </div>
  );
}

export default App;
