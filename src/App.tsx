
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import TasksPage from '@/pages/TasksPage';
import ReferralsPage from '@/pages/ReferralsPage';
import AirdropPage from '@/pages/AirdropPage';
import FundraisersPage from '@/pages/FundraisersPage';
import CoinomicsPage from '@/pages/CoinomicsPage';
import LeaderboardPage from '@/pages/LeaderboardPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminPage from '@/pages/AdminPage';
import NotFound from '@/pages/NotFound';
import { BorkProvider } from '@/context/BorkContext';

function App() {
  return (
    <BorkProvider>
      <Router>
        <Header />
        <main className="min-h-screen bg-black">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/airdrop" element={<AirdropPage />} />
            <Route path="/fundraisers" element={<FundraisersPage />} />
            <Route path="/coinomics" element={<CoinomicsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </Router>
      <Toaster position="top-right" richColors />
    </BorkProvider>
  );
}

export default App;
