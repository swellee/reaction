import React from 'react';
import logo from './logo.svg';
import './App.css';
import { PageA } from './view/page_a';
import { PageB } from './view/page_b';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>this is a demo for reaction framework</p>
        <p>
          See the <code>src/reaction.ts</code> for detail.
        </p>
      </header>
      <p>Demo:</p>
      <PageA />
      <PageB />
    </div>
  );
}

export default App;
