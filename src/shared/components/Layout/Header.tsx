import React from 'react';
import { PageKey } from '../../types';

interface HeaderProps {
  currentPage: PageKey;
}

const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Dashboard';
      case 'new-screening':
        return 'Nova Triagem';
      case 'results':
        return 'Resultados da Triagem';
      case 'signup':
        return 'Cadastro';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="flex items-center h-20 px-6 sm:px-10 bg-white shadow-sm flex-shrink-0">
      <h1 className="text-2xl font-semibold text-gray-800">
        {getPageTitle()}
      </h1>
    </header>
  );
};

export default Header;