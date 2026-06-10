import { Redirect } from 'expo-router';

/** Legacy route — worker dashboard lives on Offer tab. */
export default function ProviderProfileRedirect() {
  return <Redirect href='/(tabs)/offer-service' />;
}
