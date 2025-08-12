import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ArticlesPage from './pages/ArticlesPage';
import TestQuillPage from './pages/TestQuillPage';
import ProductsPage from './pages/ProductsPage';
import SimpleProductsPage from './pages/SimpleProductsPage';
import OrdersPage from './pages/OrdersPage';
import UsersPage from './pages/UsersPage';
import ReviewsPage from './pages/ReviewsPage';
import ActivitiesManagementPage from './pages/ActivitiesManagementPage';
import ReservationsManagementPage from './pages/ReservationsManagementPage';
import FlightReservationsManagementPage from './pages/FlightReservationsManagementPage';
import HomepageSectionsManagementPage from './pages/HomepageSectionsManagementPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

import { Toaster } from './components/ui/sonner';
import { ToastProvider } from './components/ui/use-toast';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Login route */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Test route - no authentication required */}
              <Route path="/test-quill" element={<TestQuillPage />} />
              
              {/* Protected routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/articles" element={<ArticlesPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        {/* <Route path="/products" element={<SimpleProductsPage />} /> */}
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/reviews" element={<ReviewsPage />} />
                        <Route path="/activities" element={<ActivitiesManagementPage />} />
                        <Route path="/reservations" element={<ReservationsManagementPage />} />
                        <Route path="/flights" element={<FlightReservationsManagementPage />} />
                        <Route path="/homepage-sections" element={<HomepageSectionsManagementPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>



    </ToastProvider>
  );
}

export default App;


