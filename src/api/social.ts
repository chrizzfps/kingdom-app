import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

export interface BrandIdentity {
    industry: string;
    tone: string;
    audience: string;
    context: string;
    sources: string;
    socialHandles?: {
        instagram?: string;
        tiktok?: string;
        youtube?: string;
        linkedin?: string;
        facebook?: string;
        website?: string;
    };
    updatedAt?: any;
}

export interface SocialPost {
    id?: string;
    brief: string;
    selectedIdea: string;
    allSuggestions?: string[]; // All 5 AI-generated ideas
    outputs: {
        instagram: string;
        x: string;
        tiktok: string;
        youtube_long: string;
        youtube_short: string;
    };
    createdAt?: any;
}

export const getBrandIdentity = async (projectId: string): Promise<BrandIdentity | null> => {
    const docRef = doc(db, 'projects', projectId, 'brandIdentity', 'default');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        return snap.data() as BrandIdentity;
    }
    return null;
};

export const updateBrandIdentity = async (projectId: string, data: BrandIdentity) => {
    const docRef = doc(db, 'projects', projectId, 'brandIdentity', 'default');
    await setDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
    }, { merge: true });
};

export const savePost = async (projectId: string, post: SocialPost) => {
    const colRef = collection(db, 'projects', projectId, 'posts');
    await addDoc(colRef, {
        ...post,
        createdAt: Timestamp.now()
    });
};

export const getSocialUrl = (platform: string, handle: string) => {
    if (!handle) return '';
    const cleanHandle = handle.replace('@', '').trim();

    switch (platform) {
        case 'instagram': return `https://instagram.com/${cleanHandle}`;
        case 'tiktok': return `https://tiktok.com/@${cleanHandle}`;
        case 'youtube': return `https://youtube.com/@${cleanHandle}`;
        case 'facebook': return `https://facebook.com/${cleanHandle}`;
        case 'linkedin': return `https://linkedin.com/in/${cleanHandle}`;
        case 'website':
            return handle.startsWith('http') ? handle : `https://${handle}`;
        default: return handle;
    }
};

export const getPosts = async (projectId: string): Promise<SocialPost[]> => {
    const colRef = collection(db, 'projects', projectId, 'posts');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialPost));
};
