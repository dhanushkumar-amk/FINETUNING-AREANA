import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <Layout>
              <Landing />
            </Layout>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

