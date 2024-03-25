import React from "react";
import { useLocation } from "react-router-dom";

import "./App.css";
import Iframe from "./iframe";
import EventCalendar from "./EventCalendar";

import { LicenseInfo } from "@mui/x-license-pro";

LicenseInfo.setLicenseKey(
  "ebd98f965b0879315b466e07fbba6febTz03NzAwOSxFPTE3MjkzNzg3NDYwMDAsUz1wcmVtaXVtLExNPXN1YnNjcmlwdGlvbixLVj0y"
);

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function App() {
  let query = useQuery();

  return (
    <div className="App">
      <header className="App-header">
        {query.get("UUID") === "2wdmeeeuopj2kdtg5629" ? (
          <Iframe />
        ) : (
          <EventCalendar />
        )}
      </header>
    </div>
  );
}

export default App;
