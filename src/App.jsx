// src/App.jsx
import { Routes, Route } from "react-router-dom";

// Layout
import MainLayout from "./assets/components/MainLayout";
import AuthLayout from "./assets/components/AuthLayout";

// Pages - Auth & Umum
import HalamanUtama from "./assets/Pages/HalamanUtama";
import LoginPage from "./assets/Pages/LoginPage";
import RegisterPage from "./assets/Pages/RegisterPage";
import FAQPage from "./assets/Pages/FAQPage";
import FormPengaduan from "./assets/Pages/FormPengaduan";
import NotificationPage from "./assets/Pages/NotificationPage";
import CartPage from "./assets/Pages/CartPage";
import PromoPage from "./assets/Pages/PromoPage";
import CategoryPage from "./assets/Pages/CategoryPage";
import OrderDetailPage from "./assets/Pages/OrderDetailPage";
import CheckoutPage from "./assets/Pages/CheckoutPage";
import ChatPage from "./assets/Pages/ChatPage";
import ProductDetailPage from "./assets/Pages/ProductDetailPage";
import OrderListPage from './assets/Pages/OrderListPage';

// Pages - Fitur Internal
import Dashboard from "./assets/Pages/Dashboard";
import CustomerManagement from "./assets/Pages/CustomerManagement";
import SalesManagement from "./assets/Pages/SalesManagement";
import ProductManagement from "./assets/Pages/ProductManagement";
import ComplaintForm from "./assets/Pages/ComplaintForm";
import PromoPelanggan from "./assets/Pages/PromoPelanggan";
import CustomerFeedbackManager from "./assets/Pages/ManajemenMasukanPelanggan";
import SalesHistoryPage from "./assets/Pages/RiwayatPenjualan";
import DataPelanggan from "./assets/Pages/DataPelanggan";
import ManajemenPenjualanPage from "./assets/Pages/ManajemenPenjualanPage";
import ArticleDashboard from "./assets/Pages/ArticleDashboard";
import ProfilePage from "./assets/Pages/ProfilePage";

// Context
import { CartProvider } from './assets/contexts/CartContext';
import { OrderProvider } from './assets/contexts/OrderContext';
import { AuthProvider } from './assets/contexts/AuthContext';
import SalesReportsPage from "./assets/Pages/SalesReportsPage";
import MembershipLevel from "./assets/Pages/MembershipLevel";
import LoyaltyPredict from "./assets/Pages/LoyaltyPredict";

function App() {
  return (
    <CartProvider>
      <OrderProvider>
        <AuthProvider>
          <Routes>
            {/* Halaman-halaman umum (tanpa layout utama) */}
            <Route element={<AuthLayout />}>
              <Route path="/" element={<HalamanUtama />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/form-pengaduan" element={<FormPengaduan />} />
              <Route path="/notification" element={<NotificationPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/promo-page" element={<PromoPage />} />
              <Route path="/category/:categoryName" element={<CategoryPage />} />
              <Route path="/order/:id" element={<OrderDetailPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/riwayat-pesanan" element={<OrderListPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Halaman internal (butuh MainLayout) */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/Pelanggan" element={<CustomerManagement />} />
              <Route path="/sales" element={<SalesManagement />} />
              <Route path="/loyalty-predict" element={<LoyaltyPredict />} />
              <Route path="/product" element={<ProductManagement />} />
              <Route path="/complaint-form" element={<ComplaintForm />} />
              <Route path="/loyalty" element={<MembershipLevel />} />
              <Route path="/promo" element={<PromoPelanggan />} />
              <Route path="/masukan" element={<CustomerFeedbackManager />} />
              <Route path="/riwayat" element={<SalesHistoryPage />} />
              <Route path="/data" element={<DataPelanggan />} />
              <Route path="/Penjualan" element={<ManajemenPenjualanPage />} />
              <Route path="/artikel" element={<ArticleDashboard />} />
              <Route path="/laporan-penjualan" element={<SalesReportsPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </OrderProvider>
    </CartProvider>
  );
}

export default App;