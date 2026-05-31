import { setGlobalOptions } from 'firebase-functions';

export { preventDuplicateReview } from './preventDuplicateReview.js';

setGlobalOptions({ maxInstances: 10 });
