import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';

export const anonymizeUserReviews = onDocumentDeleted(
  'users/{userId}',
  async (event) => {
    const userId = event.params.userId;
    if (!userId) return;

    const db = getFirestore();
    const reviewsSnap = await db
      .collection('reviews')
      .where('userId', '==', userId)
      .get();

    if (reviewsSnap.empty) return;

    const batch = db.batch();
    reviewsSnap.docs.forEach((reviewDoc) => {
      batch.update(reviewDoc.ref, {
        userName: 'Deleted User',
        userPhotoUrl: '',
        anonymized: true,
        updatedAt: new Date(),
      });
    });
    await batch.commit();
  },
);
