import React, { Component } from 'react';
import Login from './comps/Login/Login'
import Private from './comps/Private/Private'
import { HashRouter, Route } from 'react-router-dom'


class App extends Component {
  render() {
    return (
      <HashRouter>

        <div className="App">
          <Route exact path='/' component={Login}/>
          <Route path='/private' component={Private} />
          
        </div>
      </HashRouter>
    );
  }
}

export default App;
