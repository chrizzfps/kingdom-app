import { db } from '@/lib/firebase';
import type { Proposal } from '@/types/proposal';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, Timestamp, query, where, limit } from 'firebase/firestore';

const COLLECTION_NAME = 'proposals';

// Helper to attach metadata
const withMetadata = (data: any, snapshot: any) => {
    return {
        ...data,
        _metadata: {
            fromCache: snapshot.metadata.fromCache,
            hasPendingWrites: snapshot.metadata.hasPendingWrites
        }
    };
};

export const createProposal = async (proposal: Partial<Proposal>) => {
    const newProposal: any = {
        type: 'proposal', // Default to proposal
        ...proposal,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'draft',
        modules: []
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newProposal);
    // Determine ID: use docRef.id
    await updateDoc(docRef, { id: docRef.id });
    return { ...newProposal, id: docRef.id } as Proposal;
};

export const getProposals = async () => {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    return snapshot.docs.map(doc => {
        const data = { ...doc.data(), id: doc.id } as Proposal;
        return withMetadata(data, doc);
    });
};

export const getProposal = async (id: string) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        const data = { ...snap.data(), id: snap.id } as Proposal;
        return withMetadata(data, snap);
    }
    return null;
};

export const updateProposal = async (id: string, data: Partial<Proposal>) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
};

export const deleteProposal = async (id: string) => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
};

export const getPublicProposal = async (slug: string) => {
    const q = query(
        collection(db, COLLECTION_NAME),
        where('slug', '==', slug),
        where('status', '==', 'published'),
        limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = { ...doc.data(), id: doc.id } as Proposal;
    return withMetadata(data, doc);
};

export const slugExists = async (slug: string) => {
    const q = query(
        collection(db, COLLECTION_NAME),
        where('slug', '==', slug),
        limit(1)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
};
