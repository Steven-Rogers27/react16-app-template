import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.css';
import App from './App';
import store from './store';
import BrowserTitle from './components/browserTitle/BrowserTitle';
import * as serviceWorker from './serviceWorker';

function render(props?: any) {
  let container = document.getElementById('root');
  if (props && props.container) {
    container = props.container.querySelector('#root');
  }
  ReactDOM.render(
    <Provider store={store}>
      <React.Fragment>
        <BrowserTitle />
        <App />
      </React.Fragment>
    </Provider>,
    container
  );
}

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
  console.log('ReactMicroApp bootstrap');
}

export async function mount(props?: any) {
  console.log('ReactMicroApp mount', props);
  render(props);
}

export async function unmount(props?: any) {
  console.log('ReactMicroApp unmount', props);
  ReactDOM.unmountComponentAtNode(props.container ? props.container.querySelector('#root') : document.getElementById('root'));
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
