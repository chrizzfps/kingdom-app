import { db } from '@/lib/firebase';

import {
    collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
    query, where, orderBy, serverTimestamp
} from 'firebase/firestore';
import type { Client, Project, Invoice, AgencySettings, UserProfile, UserPayment } from '@/types/crm';
import { setDoc } from 'firebase/firestore';

// Force strict real data usage


// Helper to remove undefined values
const sanitizeData = (data: any) => {
    return Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === undefined ? null : v])
    );
};

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

// --- Clients ---

export const getClients = async (): Promise<Client[]> => {
    const q = query(collection(db, 'clients'), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() } as any;
        return convertDates(withMetadata(data, doc));
    });
};

export const getClient = async (id: string): Promise<Client | null> => {
    const docRef = doc(db, 'clients', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = { id: snap.id, ...snap.data() } as any;
    return convertDates(withMetadata(data, snap));
};

export const createClient = async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = serverTimestamp();
    const docRef = await addDoc(collection(db, 'clients'), sanitizeData({
        ...data,
        createdAt: now,
        updatedAt: now
    }));
    return docRef.id;
};

export const updateClient = async (id: string, data: Partial<Client>) => {
    const docRef = doc(db, 'clients', id);
    await updateDoc(docRef, sanitizeData({
        ...data,
        updatedAt: serverTimestamp()
    }));
};

export const deleteClient = async (id: string) => {
    await deleteDoc(doc(db, 'clients', id));
};

// --- Projects ---

export const getProjects = async (clientId?: string): Promise<Project[]> => {
    let q = query(collection(db, 'projects'), orderBy('updatedAt', 'desc'));
    if (clientId) {
        q = query(collection(db, 'projects'), where('clientId', '==', clientId));
    }
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() } as any;
        return convertDates(withMetadata(data, doc));
    });

    // Sort in memory if filtered by client to avoid index requirement
    if (clientId) {
        results.sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
    }

    return results;
};

export const getProject = async (id: string): Promise<Project | null> => {
    const docRef = doc(db, 'projects', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = { id: snap.id, ...snap.data() } as any;
    return convertDates(withMetadata(data, snap));
};

export const createProject = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = serverTimestamp();
    const docRef = await addDoc(collection(db, 'projects'), sanitizeData({
        ...data,
        createdAt: now,
        updatedAt: now
    }));
    return docRef.id;
};

export const updateProject = async (id: string, data: Partial<Project>) => {
    const docRef = doc(db, 'projects', id);
    await updateDoc(docRef, sanitizeData({
        ...data,
        updatedAt: serverTimestamp()
    }));
};

export const deleteProject = async (id: string) => {
    await deleteDoc(doc(db, 'projects', id));
};

// --- Tasks ---

export const getTasks = async (projectId: string): Promise<any[]> => {
    const q = query(collection(db, 'tasks'), where('projectId', '==', projectId));
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() } as any;
        return convertDates(withMetadata(data, doc));
    });

    // Sort in memory
    results.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

    return results;
};

export const getAllTasks = async (): Promise<any[]> => {
    const q = query(collection(db, 'tasks'), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() } as any;
        return convertDates(withMetadata(data, doc));
    });
};

export const createTask = async (data: any) => {
    const now = serverTimestamp();
    const docRef = await addDoc(collection(db, 'tasks'), sanitizeData({
        ...data,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        createdAt: now,
        updatedAt: now
    }));
    return docRef.id;
};

export const updateTask = async (id: string, data: any) => {
    const docRef = doc(db, 'tasks', id);
    await updateDoc(docRef, sanitizeData({
        ...data,
        updatedAt: serverTimestamp()
    }));
};

export const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'tasks', id));
};

// --- Resources ---

export const getResources = async (projectId: string): Promise<any[]> => {
    const q = query(collection(db, 'resources'), where('projectId', '==', projectId));
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() } as any;
        return convertDates(withMetadata(data, doc));
    });
    // Sort in memory
    results.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    return results;
};

export const createResource = async (data: any) => {
    const now = serverTimestamp();
    const docRef = await addDoc(collection(db, 'resources'), sanitizeData({
        ...data,
        createdAt: now
    }));
    return docRef.id;
};

export const deleteResource = async (id: string) => {
    await deleteDoc(doc(db, 'resources', id));
};

// --- Invoices ---

export const getInvoices = async (clientId?: string): Promise<Invoice[]> => {
    let q = query(collection(db, 'invoices'));
    if (clientId) {
        q = query(collection(db, 'invoices'), where('clientId', '==', clientId));
    }
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() } as any;
        return convertDates(withMetadata(data, doc));
    });

    results.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

    return results;
};

export const getInvoice = async (id: string): Promise<Invoice | null> => {
    const docRef = doc(db, 'invoices', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = { id: snap.id, ...snap.data() } as any;
    return convertDates(withMetadata(data, snap));
};

export const createInvoice = async (data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = serverTimestamp();
    const docRef = await addDoc(collection(db, 'invoices'), sanitizeData({
        ...data,
        createdAt: now,
        updatedAt: now
    }));
    return docRef.id;
};

export const updateInvoice = async (id: string, data: Partial<Invoice>) => {
    const docRef = doc(db, 'invoices', id);
    await updateDoc(docRef, sanitizeData({
        ...data,
        updatedAt: serverTimestamp()
    }));
};

export const deleteInvoice = async (id: string) => {
    await deleteDoc(doc(db, 'invoices', id));
};

// --- Settings ---

export const getAgencySettings = async (): Promise<AgencySettings | null> => {
    const docRef = doc(db, 'settings', 'agency');
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data() as AgencySettings;
    return withMetadata(data, snap) as any;
};

export const updateAgencySettings = async (data: Partial<AgencySettings>) => {
    const docRef = doc(db, 'settings', 'agency');
    await setDoc(docRef, sanitizeData(data), { merge: true });
};

// --- Users ---

export const getUsers = async (): Promise<UserProfile[]> => {
    const q = query(collection(db, 'users'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() } as any;
        return withMetadata(data, doc);
    });
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
    // Split data into public and private
    const { salary, currency, paymentMethod, paymentDetails, notes, ...publicData } = data;
    const privateData = { salary, currency, paymentMethod, paymentDetails, notes };

    // 1. Update public profile
    if (Object.keys(publicData).length > 0) {
        const docRef = doc(db, 'users', uid);
        await updateDoc(docRef, sanitizeData({
            ...publicData,
            updatedAt: serverTimestamp()
        }));
    }

    // 2. Update private profile (if there are private fields)
    // We check if any private field is defined (not undefined)
    const hasPrivateFields = Object.values(privateData).some(v => v !== undefined);

    if (hasPrivateFields) {
        const privateRef = doc(db, 'users', uid, 'sensitive', 'profile');

        // We use setDoc with merge: true because the subcollection might not exist yet
        await setDoc(privateRef, sanitizeData({
            ...privateData,
            updatedAt: serverTimestamp()
        }), { merge: true });
    }
};

export const getUserPrivateProfile = async (uid: string): Promise<Partial<UserProfile> | null> => {
    try {
        const privateRef = doc(db, 'users', uid, 'sensitive', 'profile');
        const snap = await getDoc(privateRef);
        if (snap.exists()) {
            return snap.data() as Partial<UserProfile>;
        }
        return null;
    } catch (error) {
        console.warn("Could not fetch private profile (likely insufficient permissions):", error);
        return null;
    }
};

export const updateUserRole = async (uid: string, role: 'admin' | 'member' | 'viewer') => {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { role });
};

export const getUserPayments = async (userId: string): Promise<UserPayment[]> => {
    // Query without orderBy to avoid needing composite index
    const q = query(collection(db, 'user_payments'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => {
        const data = { id: doc.id, ...doc.data() } as any;
        return convertDates(withMetadata(data, doc));
    });
    // Sort in memory by date descending
    results.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
    return results;
};

export const addUserPayment = async (data: Omit<UserPayment, 'id' | 'createdAt'>) => {
    const now = serverTimestamp();
    const docRef = await addDoc(collection(db, 'user_payments'), sanitizeData({
        ...data,
        createdAt: now
    }));
    return docRef.id;
};

export const deleteUserPayment = async (id: string) => {
    await deleteDoc(doc(db, 'user_payments', id));
};

// Admin: Create User without logging out current user
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export const registerUser = async (email: string, password: string = 'Kingdom2024!', displayName: string, role: string = 'viewer') => {
    // 1. Create a secondary app instance to avoid affecting current auth state
    const secondaryApp = initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
    }, 'SecondaryApp');

    const secondaryAuth = getAuth(secondaryApp);

    try {
        // 2. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const user = userCredential.user;

        // 3. Create user profile in Firestore (using main DB connection)
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            displayName: displayName,
            role: role,
            photoURL: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            preferences: {}
        });

        // 3b. Create PRIVATE profile for sensitive data (initially empty but secure)
        await setDoc(doc(db, 'users', user.uid, 'sensitive', 'profile'), {
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            notes: 'Usuario creado inicialmente.'
        });

        // 4. Sign out from secondary app
        await signOut(secondaryAuth);

        return user.uid;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    } finally {
        // 5. Cleanup
        await deleteApp(secondaryApp);
    }
};

export const deleteUser = async (uid: string) => {
    // We can only delete from Firestore here. 
    // To delete from Auth, we would need a Cloud Function or Admin SDK.
    await deleteDoc(doc(db, 'users', uid));
};

// --- Helpers ---

const convertDates = (item: any): any => {
    if (!item) return item;
    const newItem = { ...item };
    if (newItem.createdAt?.toDate) newItem.createdAt = newItem.createdAt.toDate();
    if (newItem.updatedAt?.toDate) newItem.updatedAt = newItem.updatedAt.toDate();
    if (newItem.deadline?.toDate) newItem.deadline = newItem.deadline.toDate();
    if (newItem.launchDate?.toDate) newItem.launchDate = newItem.launchDate.toDate();
    if (newItem.startDate?.toDate) newItem.startDate = newItem.startDate.toDate();
    if (newItem.dueDate?.toDate) newItem.dueDate = newItem.dueDate.toDate();
    if (newItem.date?.toDate) newItem.date = newItem.date.toDate();
    return newItem;
};
