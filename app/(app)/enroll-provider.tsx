import { Redirect } from 'expo-router';

/** Legacy route — redirects to the new worker onboarding wizard. */
export default function EnrollProviderRedirect() {
  return <Redirect href='/become-worker' />;
}
