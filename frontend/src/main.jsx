import React from "react";
import ReactDOM from "react-dom/client";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import ComplaintSystem from './components/Complaints';


<Route path="/complaints" element={<ComplaintSystem />} />
4.  **Add a Link:** In your website's navigation bar or user dashboard, add a link that directs users to the new `/complaints` page.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
