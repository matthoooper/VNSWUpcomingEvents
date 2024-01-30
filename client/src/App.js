import React from "react";
import { useLocation } from "react-router-dom";
import logo from "./logo.svg";
import "./App.css";
import Iframe from "./iframe";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function App() {
  let query = useQuery();

  return (
    <div className="App">
      <header className="App-header">
        {query.get("component") === "iframe" ? (
          <Iframe />
        ) : (
          <div>
            <img src={logo} className="App-logo" alt="logo" />
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
