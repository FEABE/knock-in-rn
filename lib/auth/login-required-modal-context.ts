import { createContext, useContext } from 'react';

export type LoginRequiredModalContextValue = {
  showLoginRequiredModal: () => void;
};

export const LoginRequiredModalContext = createContext<LoginRequiredModalContextValue | null>(null);

export function useLoginRequiredModal(): LoginRequiredModalContextValue {
  const context = useContext(LoginRequiredModalContext);
  if (!context) {
    throw new Error('useLoginRequiredModal must be used inside LoginRequiredModalProvider');
  }
  return context;
}
