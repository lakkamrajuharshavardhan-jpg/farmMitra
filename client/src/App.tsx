import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { FieldDetailPage } from './pages/FieldDetailPage';
import { LeafDoctorPage } from './pages/LeafDoctorPage';
import { CropKnowledgePage } from './pages/CropKnowledgePage';
import { FertilizerKnowledgePage } from './pages/FertilizerKnowledgePage';
import { HowToUsePage } from './pages/HowToUsePage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/field/:id" element={<FieldDetailPage />} />
              <Route path="/leaf-doctor" element={<LeafDoctorPage />} />
              <Route path="/crop-knowledge" element={<CropKnowledgePage />} />
              <Route path="/fertilizer-knowledge" element={<FertilizerKnowledgePage />} />
              <Route path="/how-to-use" element={<HowToUsePage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
