import ReactDOM from "react-dom/client";
import App from "./App";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./app/store";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
