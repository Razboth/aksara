import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import TransactionForm from './pages/TransactionForm';
import Budgets from './pages/Budgets';
import Vendors from './pages/Vendors';
import VendorDetail from './pages/VendorDetail';
import Services from './pages/Services';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transaksi" element={<Transactions />} />
        <Route path="transaksi/baru" element={<TransactionForm />} />
        <Route path="transaksi/:id" element={<TransactionForm />} />
        <Route path="anggaran" element={<Budgets />} />
        <Route path="vendor" element={<Vendors />} />
        <Route path="vendor/:id" element={<VendorDetail />} />
        <Route path="layanan" element={<Services />} />
        <Route path="pengaturan" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
