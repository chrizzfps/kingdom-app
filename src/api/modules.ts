import { db } from '@/lib/firebase';
import type { ProposalModule, ModuleType } from '@/types/proposal';
import {
  collection,
  addDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  Timestamp,
  query,
} from 'firebase/firestore';

export const modulesCol = (proposalId: string) =>
  collection(db, 'proposals', proposalId, 'modules');

// Helper to remove undefined values
const sanitizeData = (data: any) => {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === undefined ? null : v])
  );
};

export const getModules = async (proposalId: string) => {
  // Removed orderBy to avoid index requirement
  const q = query(modulesCol(proposalId));
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ ...(d.data() as ProposalModule), id: d.id }));
  // Sort in memory
  results.sort((a, b) => (a.order || 0) - (b.order || 0));
  return results;
};

export const listenModules = (
  proposalId: string,
  cb: (mods: ProposalModule[]) => void
) => {
  // Removed orderBy to avoid index requirement
  const q = query(modulesCol(proposalId));
  return onSnapshot(q, (snap) => {
    const mods = snap.docs.map((d) => ({ ...(d.data() as ProposalModule), id: d.id }));
    // Sort in memory
    mods.sort((a, b) => (a.order || 0) - (b.order || 0));
    cb(mods);
  });
};

export const createModule = async (
  proposalId: string,
  type: ModuleType,
  data: any,
  order: number
) => {
  const mod: Omit<ProposalModule, 'id'> = {
    type,
    isVisible: true,
    order,
    data,
    createdAt: Timestamp.now() as any,
    updatedAt: Timestamp.now() as any,
  } as any;
  const ref = await addDoc(modulesCol(proposalId), mod);
  await updateDoc(ref, { id: ref.id });
  return { ...mod, id: ref.id } as ProposalModule;
};

export const updateModuleData = async (
  proposalId: string,
  moduleId: string,
  data: any
) => {
  const ref = doc(db, 'proposals', proposalId, 'modules', moduleId);
  // Save version snapshot
  const verCol = collection(db, 'proposals', proposalId, 'modules', moduleId, 'versions');
  await addDoc(verCol, { data: sanitizeData(data), ts: Timestamp.now() });
  await updateDoc(ref, { data: sanitizeData(data), updatedAt: Timestamp.now() });
};

export const toggleModuleVisibility = async (
  proposalId: string,
  moduleId: string,
  isVisible: boolean
) => {
  const ref = doc(db, 'proposals', proposalId, 'modules', moduleId);
  await updateDoc(ref, { isVisible, updatedAt: Timestamp.now() });
};

export const deleteModuleById = async (proposalId: string, moduleId: string) => {
  const ref = doc(db, 'proposals', proposalId, 'modules', moduleId);
  await deleteDoc(ref);
  // reindex orders
  const mods = await getModules(proposalId);
  const batch = writeBatch(db);
  mods.forEach((m, idx) => {
    batch.update(doc(db, 'proposals', proposalId, 'modules', m.id), {
      order: idx,
      updatedAt: Timestamp.now(),
    });
  });
  await batch.commit();
};

export const reorderModulesTx = async (
  proposalId: string,
  activeId: string,
  overId: string
) => {
  await runTransaction(db, async (tx) => {
    // Removed orderBy within transaction query too
    const mods = await getDocs(query(modulesCol(proposalId)));
    const list = mods.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ProposalModule[];
    // Sort manually
    list.sort((a, b) => (a.order || 0) - (b.order || 0));

    const oldIndex = list.findIndex((m) => m.id === activeId);
    const newIndex = list.findIndex((m) => m.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;
    const moved = list.splice(oldIndex, 1)[0];
    list.splice(newIndex, 0, moved);
    list.forEach((m, idx) => {
      const r = doc(db, 'proposals', proposalId, 'modules', m.id);
      tx.update(r, { order: idx, updatedAt: Timestamp.now() });
    });
  });
};
