import { onInit } from 'firebase-functions/v2/core';
import {
  onDocumentCreated,
  onDocumentWritten,
} from 'firebase-functions/v2/firestore';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

onInit(() => {
  if (getApps().length === 0) {
    initializeApp();
  }
});

export const preventDuplicateReview = onDocumentCreated(
  'reviews/{reviewId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;

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

export const aggregateReviewRating = onDocumentWritten(
  'reviews/{reviewId}',
  async (event) => {
    const after = event.data?.after;
    const before = event.data?.before;

    const providerId = (
      after?.exists ? after.data()?.providerId : before?.data()?.providerId
    ) as string | undefined;
    if (!providerId) return;

    const reviewsSnap = await getFirestore()
      .collection('reviews')
      .where('providerId', '==', providerId)
      .get();

    const providerRef = getFirestore()
      .collection('service_providers')
      .doc(providerId);

    if (reviewsSnap.empty) {
      await providerRef.set(
        { rating: 0, reviewCount: 0, updatedAt: new Date() },
        { merge: true },
      );
      return;
    }

    let total = 0;
    reviewsSnap.forEach((doc) => {
      total += doc.data().rating ?? 0;
    });

    const reviewCount = reviewsSnap.size;
    const rating = Math.round((total / reviewCount) * 10) / 10;

    await providerRef.set({ rating, reviewCount, updatedAt: new Date() }, { merge: true });
  },
);
