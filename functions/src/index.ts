import { setGlobalOptions } from 'firebase-functions/v2/options';

setGlobalOptions({
  maxInstances: 10,
  region: 'asia-south1',
});

export {
  preventDuplicateReview,
  aggregateReviewRating,
} from './preventDuplicateReview.js';
