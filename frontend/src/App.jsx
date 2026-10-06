import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { GoalsPage } from './pages/GoalsPage';
import { RecurringPage } from './pages/RecurringPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TransactionModal } from './components/TransactionModal';

export function App() {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Global Transaction Modal state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-primary)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 50,
              height: 50,
              border: '3px solid rgba(255, 255, 255, 0.1)',
              borderTopColor: '#6366f1',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1.25rem'
            }}
          />
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Initializing FinPulse Workspace...</div>
        </div>
      </div>
    );
  }

  // Not authenticated -> Show Login / Register
  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <div className="bg-glow-orb orb-1" />
        <div className="bg-glow-orb orb-2" />
        {authView === 'login' ? (
          <LoginPage onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  const handleOpenTransactionModal = (tx = null) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleTransactionSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app-container">
      {/* Background Ambient Glows */}
      <div className="bg-glow-orb orb-1" />
      <div className="bg-glow-orb orb-2" />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          onOpenTransactionModal={() => handleOpenTransactionModal()}
          setMobileOpen={setMobileOpen}
          setActiveTab={setActiveTab}
        />

        <main className="main-body" key={refreshKey}>
          {activeTab === 'dashboard' && (
            <Dashboard
              onOpenTransactionModal={handleOpenTransactionModal}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPage
              onOpenTransactionModal={handleOpenTransactionModal}
              onEditTransaction={(tx) => handleOpenTransactionModal(tx)}
            />
          )}

          {activeTab === 'budgets' && <BudgetsPage />}

          {activeTab === 'goals' && <GoalsPage />}

          {activeTab === 'recurring' && (
            <RecurringPage onOpenTransactionModal={handleOpenTransactionModal} />
          )}

          {activeTab === 'analytics' && <AnalyticsPage />}

          {activeTab === 'categories' && <CategoriesPage />}

          {activeTab === 'admin' && isAdmin && <AdminPage />}

          {activeTab === 'profile' && <ProfilePage />}
        </main>
      </div>

      {/* Global Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        transaction={editingTx}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}

export default App;
