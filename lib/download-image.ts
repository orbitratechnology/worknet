import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

export async function downloadImageToGallery(url: string): Promise<boolean> {
  const permission = await MediaLibrary.requestPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      'Permission needed',
      'Allow photo library access to save images.',
    );
    return false;
  }

  try {
    const extension = url.includes('.png') ? 'png' : 'jpg';
    const filename = `worknet-${Date.now()}.${extension}`;
    const destination = `${FileSystem.cacheDirectory}${filename}`;
    const downloaded = await FileSystem.downloadAsync(url, destination);
    await MediaLibrary.saveToLibraryAsync(downloaded.uri);
    Alert.alert('Saved', 'Image saved to your photo library.');
    return true;
  } catch {
    Alert.alert('Download failed', 'Could not save this image. Try again.');
    return false;
  }
}
