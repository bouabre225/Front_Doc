import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientApp from './client/ClientApp';
import AdminApp from './admin/AdminApp';
import { LangProvider } from './client/context/LangContext';

function App() {
  return (
    <LangProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<ClientApp />} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Router>
    </LangProvider>
  );
}

export default App;