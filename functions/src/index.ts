import { setGlobalOptions } from 'firebase-functions/v2/options';
import { getApps, initializeApp } from 'firebase-admin/app';

if (getApps().length === 0) {
  initializeApp();
}

setGlobalOptions({
  maxInstances: 10,
  region: 'asia-south1',
});

export {
  preventDuplicateReview,
  aggregateReviewRating,
} from './preventDuplicateReview.js';
export { anonymizeUserReviews } from './anonymizeUserReviews.js';
