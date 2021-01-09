import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import Counter from './examples/counter/Counter';

const BASE_NAME = window.__POWERED_BY_QIANKUN__ ? '/react' : '';

function App() {
  return (
    <Router
      basename={BASE_NAME}
    >
      <Switch>
        <Route
          path="/"
        >
          <React.Fragment>
            <Counter />
          </React.Fragment>
        </Route>
        <Redirect
          to="/"
        />
      </Switch>
    </Router>
  );
}

export default App;
