import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Provider, KV, ModuleStore, mapProp, ModuleAction, doAction } from './reaction'

const App: React.FC = () => {
  return (
    <Provider>

      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
        <TestReaction></TestReaction>
      </div>
    </Provider>

  );
}



const MODULE_USER = 'module_user';
const userStore: ModuleStore = {
  module: MODULE_USER,
  username: 'Will Li',
  clickCnt: 0
}

const clickAction: ModuleAction = {
  module: MODULE_USER,
  process: async (payload, moduleState) => {
    let { clickCnt } = moduleState;
    clickCnt++;
    return { clickCnt };
  }
}


@mapProp(userStore, 'username', 'clickCnt')
class TestReaction extends React.Component<KV>{
  render() {
    return (
      <div className="test-reaction">
        <h1>{`welcome ${this.props.username}`}</h1>
        {`clicked count: ${this.props.clickCnt}`}
        <div className='btn' onClick={this.newClick}>click</div>
      </div>
    );
  }

  newClick = () => {
    doAction(clickAction);
  }
}


export default App;
