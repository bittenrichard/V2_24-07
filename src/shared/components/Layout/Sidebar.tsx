import React from 'react';
import { LayoutDashboard, PlusCircle, Settings, LogOut, ChevronsLeft, ChevronsRight, Database } from 'lucide-react'; // Importe o ícone Database
import { PageKey } from '../../types';
import { UserProfile } from '../../../features/auth/types';

interface SidebarProps {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  onLogout: () => void;
  user: UserProfile | null;
  isCollapsed: boolean;
  onToggle: () => void;
}

const getAvatarFallback = (name: string | null) => {
    const displayName = name || '?';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=indigo&color=fff&bold=true`;
};

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onLogout,
  user,
  isCollapsed,
  onToggle
}) => {
  const menuItems = [
    { key: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, active: currentPage === 'dashboard' },
    { key: 'new-screening' as const, label: 'Nova Triagem', icon: PlusCircle, active: currentPage === 'new-screening' },
    // --- NOVO ITEM DE MENU ADICIONADO ---
    { key: 'database' as const, label: 'Banco de Talentos', icon: Database, active: currentPage === 'database' },
    { key: 'settings' as const, label: 'Configurações', icon: Settings, active: currentPage === 'settings' }
  ];

  return (
    <div className={`hidden md:flex flex-col bg-white shadow-md transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      <div className="flex items-center justify-center h-20 shadow-sm flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-800 overflow-hidden">
          {isCollapsed ? (
            <span className="text-indigo-600">R.</span>
          ) : (
            <>Recruta.<span className="text-indigo-600">AI</span></>
          )}
        </h1>
      </div>

      <nav className="flex-grow p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex items-center w-full p-3 rounded-lg font-medium transition-colors ${
              item.active ? 'text-white bg-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title={item.label}
          >
            <item.icon className={isCollapsed ? '' : 'mr-3'} size={20} />
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-2 border-t border-gray-200">
        <div className={`flex items-center w-full p-2 rounded-lg ${isCollapsed ? 'justify-center' : ''}`}>
          <img
            src={user?.avatar_url || getAvatarFallback(user?.nome || null)}
            alt="avatar"
            className="h-10 w-10 rounded-full object-cover flex-shrink-0 bg-indigo-100"
          />
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="font-semibold text-sm text-gray-800 truncate">{user?.nome}</p>
              <p className="text-xs text-gray-500 truncate">{user?.empresa}</p>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className={`flex items-center w-full p-3 mt-1 text-gray-500 hover:bg-gray-100 rounded-lg font-medium transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title="Sair"
        >
          <LogOut className={isCollapsed ? '' : 'mr-3'} size={20} />
          {!isCollapsed && <span>Sair</span>}
        </button>
        
        <button
          onClick={onToggle}
          className={`flex items-center w-full p-3 mt-1 text-gray-500 hover:bg-gray-100 rounded-lg font-medium transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          {isCollapsed ? <ChevronsRight size={20}/> : <ChevronsLeft size={20}/>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;