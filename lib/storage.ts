import { getDownloadURL, putFile, ref } from '@react-native-firebase/storage';
import { storage } from './firebase';

const STORAGE_BUCKET = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '';

export function isFirebaseStorageUrl(uri: string): boolean {
  if (!uri) return false;
  if (STORAGE_BUCKET && uri.includes(STORAGE_BUCKET)) return true;
  return (
    uri.includes('firebasestorage.googleapis.com') ||
    uri.includes('firebasestorage.app')
  );
}

export function isLocalUri(uri: string): boolean {
  return /^(file|content):\/\//i.test(uri);
}

export function isRemoteHttpUri(uri: string): boolean {
  return /^https?:\/\//i.test(uri);
}

export function profilePhotoPath(uid: string): string {
  return `profile_photos/${uid}/avatar.jpg`;
}

export function workSamplePath(uid: string, index: number): string {
  return `work_samples/${uid}/${index}.jpg`;
}

/**
 * Uploads a device-local image via native `putFile`. Remote URLs are not supported here.
 */
export async function uploadLocalFile(uri: string, path: string): Promise<string> {
  if (!isLocalUri(uri)) {
    throw new Error('Only photos from your device can be uploaded to storage.');
  }
  if (isFirebaseStorageUrl(uri)) return uri;

  const storageRef = ref(storage, path);
  await putFile(storageRef, uri, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}

/**
 * Uses the URI as-is for remote/Storage URLs; uploads only when the URI is local.
 */
export async function resolveImageUrl(uri: string, path: string): Promise<string> {
  if (!uri) return '';
  if (isFirebaseStorageUrl(uri) || isRemoteHttpUri(uri)) return uri;
  if (isLocalUri(uri)) return uploadLocalFile(uri, path);
  return uri;
}

/** @deprecated Use uploadLocalFile */
export const uploadFile = uploadLocalFile;

/** @deprecated Use resolveImageUrl */
export const ensureStorageUrl = resolveImageUrl;
