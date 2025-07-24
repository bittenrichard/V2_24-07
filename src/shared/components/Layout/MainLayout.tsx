import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { PageKey } from '../../types';
import { UserProfile } from '../../../features/auth/types';

interface MainLayoutProps {
  currentPage: PageKey;
  user: UserProfile | null;
  onNavigate: (page: PageKey) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  currentPage,
  user,
  onNavigate,
  onLogout,
  children
}) => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <div className="flex flex-col flex-grow">
        <Header currentPage={currentPage} />
        <main className="flex-grow p-6 sm:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;