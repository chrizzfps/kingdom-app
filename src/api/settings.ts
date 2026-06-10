import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

// Requires Firestore rule:
// match /settings/{document} {
//   allow read: if true;
//   allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
// }

export interface GlobalPaymentMethod {
    id: string;
    type: string;
    details: Record<string, string>;
}

export const getGlobalPaymentMethods = async (): Promise<GlobalPaymentMethod[]> => {
    const snap = await getDoc(doc(db, 'settings', 'paymentMethods'));
    if (!snap.exists()) return [];
    return snap.data().methods || [];
};

export const saveGlobalPaymentMethods = async (methods: GlobalPaymentMethod[]) => {
    await setDoc(
        doc(db, 'settings', 'paymentMethods'),
        { methods, updatedAt: Timestamp.now() },
        { merge: true }
    );
};
