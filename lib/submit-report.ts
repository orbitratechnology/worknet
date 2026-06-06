import { db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from '@react-native-firebase/firestore';

export type ReportTargetType = 'review' | 'provider';

export async function submitContentReport(params: {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  providerId?: string;
}) {
  await addDoc(collection(db, 'reports'), {
    reporterId: params.reporterId,
    targetType: params.targetType,
    targetId: params.targetId,
    reason: params.reason.trim(),
    providerId: params.providerId ?? null,
    createdAt: serverTimestamp(),
    status: 'open',
  });
}
