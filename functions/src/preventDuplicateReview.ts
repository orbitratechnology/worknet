import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();

export const preventDuplicateReview = onDocumentCreated(
  'reviews/{reviewId}',
  async (event) => {
    const snap = event.data;
    if (!snap) {
      return;
    }

    const { providerId, userId } = snap.data();
    const reviewsRef = getFirestore().collection('reviews');
    const existing = await reviewsRef
      .where('providerId', '==', providerId)
      .where('userId', '==', userId)
      .get();

    if (existing.size > 1) {
      await snap.ref.delete();
    }
  },
);
