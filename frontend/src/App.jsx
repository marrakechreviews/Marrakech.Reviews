import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useModal } from './contexts/ModalContext';
import LoginModal from './components/LoginModal';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ArticleGeneratorPage from './pages/ArticleGeneratorPage';
import GoogleReviewsPage from './pages/GoogleReviewsPage';
import HostingReservationsPage from './pages/HostingReservationsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import OrganizedTravelsPage from './pages/OrganizedTravelsPage';
import OrganizedTravelDetailsPage from './pages/OrganizedTravelDetailsPage';
import InstagramPage from './pages/InstagramPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ThankYouPage from './pages/ThankYouPage';
import TravelThankYouPage from './pages/TravelThankYouPage';
import ReservationPaymentPage from './pages/ReservationPaymentPage';
import OrderPaymentPage from './pages/OrderPaymentPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import FAQPage from './pages/FAQPage';
import ShippingInfoPage from './pages/ShippingInfoPage';
import ReturnsPage from './pages/ReturnsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import OrderDetailPage from './pages/OrderDetailPage';
import SoccerPage from './pages/SoccerPage';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isModalOpen, closeModal, onSuccess } = useModal();

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-background">
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/articles" element={<ArticlesPage />} />
                <Route path="/articles/:slug" element={<ArticleDetailPage />} />
                <Route path="/article-generator" element={<ArticleGeneratorPage />} />
                <Route path="/reviews" element={<GoogleReviewsPage />} />
                <Route path="/hosting" element={<HostingReservationsPage />} />
                <Route path="/activities" element={<ActivitiesPage />} />
                <Route path="/activities/:slug" element={<ActivityDetailPage />} />
                <Route path="/travels" element={<OrganizedTravelsPage />} />
                <Route path="/travels/:destination" element={<OrganizedTravelDetailsPage />} />
                <Route path="/instagram" element={<InstagramPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />
                <Route path="/thank-you" element={<ThankYouPage />} />
                <Route path="/payment/reservation/:token" element={<ReservationPaymentPage />} />
                <Route path="/payment/order/token/:token" element={<OrderPaymentPage />} />
                <Route path="/travel/thank-you" element={<TravelThankYouPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/shipping" element={<ShippingInfoPage />} />
                <Route path="/returns" element={<ReturnsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/category/:category" element={<ProductsPage />} />
                <Route path="/search" element={<ProductsPage />} />
                <Route path="/soccer" element={<SoccerPage />} />
              </Routes>
            </Layout>
            <Toaster position="top-right" />
            <LoginModal
              isOpen={isModalOpen}
              onClose={closeModal}
              onLoginSuccess={() => {
                if (onSuccess) {
                  onSuccess();
                }
              }}
            />
          </div>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;

