import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return React.createElement('h1', null, 'Hello Codespaces!');
}

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(React.createElement(App));
}