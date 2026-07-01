import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';
import {
  FieldValue,
  getFirestore,
  type DocumentReference,
} from 'firebase-admin/firestore';
import {
  isValidSriLankaNic,
  normalizeSriLankaNic,
} from './validation/nic.js';

async function revertNicWrite(
  userId: string,
  beforeExists: boolean,
  beforeNic: string | undefined,
  ref: DocumentReference,
): Promise<void> {
  const db = getFirestore();

  if (!beforeExists) {
    await ref.delete();
  } else if (beforeNic) {
    await ref.update({ nicNumber: beforeNic });
  } else {
    await ref.update({ nicNumber: FieldValue.delete() });
  }

  const userRef = db.collection('users').doc(userId);
  const userSnap = await userRef.get();
  const userNic = userSnap.data()?.nicNumber as string | undefined;
  if (userSnap.exists && userSnap.data()?.nicVerified && userNic) {
    const normalizedAttempt = beforeNic
      ? normalizeSriLankaNic(beforeNic)
      : null;
    if (!beforeNic || userNic === normalizedAttempt) {
      await userRef.set(
        {
          nicNumber: FieldValue.delete(),
          nicVerified: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
  }
}

export const enforceNicPolicy = onDocumentWritten(
  {
    document: 'provider_verification/{userId}',
    region: 'asia-south1',
  },
  async (event) => {
    const db = getFirestore();
    const afterSnap = event.data?.after;
    if (!afterSnap?.exists) {
      return;
    }

    const data = afterSnap.data();
    const nic = data?.nicNumber;
    if (typeof nic !== 'string' || !nic.trim()) {
      return;
    }

    const userId = event.params.userId;
    const beforeExists = event.data?.before?.exists ?? false;
    const beforeNic = event.data?.before?.data()?.nicNumber as string | undefined;

    if (!isValidSriLankaNic(nic)) {
      logger.warn('Rejected invalid NIC on provider_verification', { userId });
      await revertNicWrite(userId, beforeExists, beforeNic, afterSnap.ref);
      return;
    }

    if (beforeNic && beforeNic !== nic) {
      logger.warn('Blocked NIC modification on provider_verification', {
        userId,
      });
      await afterSnap.ref.update({ nicNumber: beforeNic });
      return;
    }

    const normalized = normalizeSriLankaNic(nic);
    const registryRef = db.collection('nic_registry').doc(normalized);

    try {
      await db.runTransaction(async (tx) => {
        const regSnap = await tx.get(registryRef);
        const ownerId = regSnap.data()?.userId as string | undefined;

        if (ownerId && ownerId !== userId) {
          throw new Error('DUPLICATE_NIC');
        }

        if (!regSnap.exists) {
          tx.set(registryRef, {
            userId,
            createdAt: FieldValue.serverTimestamp(),
          });
        }

        tx.set(
          db.collection('users').doc(userId),
          {
            nicNumber: normalized,
            nicVerified: true,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';
      if (message === 'DUPLICATE_NIC') {
        logger.warn('Rejected duplicate NIC registration', { userId, normalized });
        await revertNicWrite(userId, beforeExists, beforeNic, afterSnap.ref);
        return;
      }
      throw error;
    }

    if (normalized !== nic) {
      await afterSnap.ref.update({ nicNumber: normalized });
    }
  },
);
