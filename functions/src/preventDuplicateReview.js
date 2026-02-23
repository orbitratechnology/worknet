const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Anti-fraud: Only allow one review per provider per user
exports.preventDuplicateReview = functions.firestore
  .document('reviews/{reviewId}')
  .onCreate(async (snap, context) => {
    const { providerId, userId } = snap.data();
    const reviewsRef = admin.firestore().collection('reviews');
    const existing = await reviewsRef
      .where('providerId', '==', providerId)
      .where('userId', '==', userId)
      .get();
    if (!existing.empty) {
      // Delete duplicate
      await snap.ref.delete();
      return null;
    }
    return null;
  });
