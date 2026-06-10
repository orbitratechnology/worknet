import { getFirestore } from '@react-native-firebase/firestore';
import { getStorage } from '@react-native-firebase/storage';

export const db = getFirestore();
export const storage = getStorage();
