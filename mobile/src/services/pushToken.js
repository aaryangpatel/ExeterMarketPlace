/**
 * Store push token in Firestore for the current user.
 */
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';

export async function savePushToken(userId, token) {
  if (!userId || !token) return;
  await setDoc(
    doc(firestore, 'users', userId),
    { pushToken: token, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}
