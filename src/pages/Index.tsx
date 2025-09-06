
import React from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/LoginForm';
import Tabs from '@/components/Tabs';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <Tabs /> : <LoginForm />;
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
