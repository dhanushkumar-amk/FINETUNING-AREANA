import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Arena from './pages/Arena';

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
        <Route 
          path="/arena" 
          element={
            <Layout>
              <Arena />
            </Layout>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

