import React from 'react';
import ReactDOM from 'react-dom';

import { UIEvents } from "@invictus/engine/core/game";
import EventEmitter from "@invictus/engine/utils/eventEmitter";

import { Provider } from 'react-redux';
import App from './app';
import store, { connectStore } from './store';

export default function renderUI(events: EventEmitter<UIEvents>) {
  connectStore(events);
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    root,
  );
}
