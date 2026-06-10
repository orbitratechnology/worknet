import { useAuth } from '@/context/auth';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SignInSheetHost } from '@/components/ui/sign-in-sheet';

interface AuthGateContextType {
  openSignInSheet: (message: string, returnPath?: string) => void;
  gateAction: (message: string, onAuthed: () => void) => boolean;
}

const AuthGateContext = createContext<AuthGateContextType | undefined>(
  undefined,
);

export function AuthGateProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [message, setMessage] = useState('Sign in to continue');
  const [returnPath, setReturnPath] = useState<string | undefined>();

  const openSignInSheet = useCallback((msg: string, path?: string) => {
    setMessage(msg);
    setReturnPath(path);
    sheetRef.current?.present();
  }, []);

  const gateAction = useCallback(
    (msg: string, onAuthed: () => void) => {
      if (user) {
        onAuthed();
        return true;
      }
      openSignInSheet(msg);
      return false;
    },
    [user, openSignInSheet],
  );

  const value = useMemo(
    () => ({ openSignInSheet, gateAction }),
    [openSignInSheet, gateAction],
  );

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      <SignInSheetHost
        sheetRef={sheetRef}
        message={message}
        returnPath={returnPath}
        router={router}
      />
    </AuthGateContext.Provider>
  );
}

export function useAuthGate() {
  const ctx = useContext(AuthGateContext);
  if (!ctx) {
    throw new Error('useAuthGate must be used within AuthGateProvider');
  }
  return ctx;
}
