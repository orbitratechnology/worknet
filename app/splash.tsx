import { useAuth } from '@/context/auth';
import { SplashScreen } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function SplashScreenController() {
  const { loading } = useAuth();

  if (!loading) {
    SplashScreen.hide();
  }

  return null;
}
