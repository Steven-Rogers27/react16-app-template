import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import Uploader from './components/uploader/Uploader';
import uuid from './utils/uuidGenerator';

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
            <Uploader
              belongId={uuid()}
              type="SIGN_UP"
            />
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
