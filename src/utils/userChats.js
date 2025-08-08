import { db } from "../config/Firebase";
import {
    addDoc,
    collection,
    serverTimestamp,
    query,
    orderBy,
    limit as limitResults,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";

export async function createUserChat(userId, { title = "محادثة جديدة" } = {}) {
    if (!userId) throw new Error("Missing userId");
    const colRef = collection(db, `users/${userId}/threads`);
    const ref = await addDoc(colRef, {
        title,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return { id: ref.id };
}

export async function listUserChats(userId, { limit = 50 } = {}) {
    if (!userId) return [];
    const colRef = collection(db, `users/${userId}/threads`);
    const q = query(colRef, orderBy("updatedAt", "desc"), limitResults(limit));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function loadChatMessages(userId, threadId, { limit = 200 } = {}) {
    if (!userId || !threadId) return [];
    const colRef = collection(db, `users/${userId}/threads/${threadId}/messages`);
    const q = query(colRef, orderBy("createdAt", "asc"), limitResults(limit));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addChatMessage({ userId, threadId, role, content }) {
    if (!userId || !threadId) throw new Error("Missing userId/threadId");
    const colRef = collection(db, `users/${userId}/threads/${threadId}/messages`);
    const ref = await addDoc(colRef, {
        role, // "user" | "assistant"
        content,
        createdAt: serverTimestamp(),
    });
    // bump thread updatedAt
    await updateDoc(doc(db, `users/${userId}/threads/${threadId}`), {
        updatedAt: serverTimestamp(),
    });
    return { id: ref.id };
}

export async function renameUserChat(userId, threadId, title) {
    if (!userId || !threadId) throw new Error("Missing userId/threadId");
    await updateDoc(doc(db, `users/${userId}/threads/${threadId}`), {
        title,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteThread(userId, threadId) {
    if (!userId || !threadId) throw new Error("Missing userId/threadId");
    // delete messages
    const msgsCol = collection(db, `users/${userId}/threads/${threadId}/messages`);
    const msgSnap = await getDocs(msgsCol);
    await Promise.all(msgSnap.docs.map((d) => deleteDoc(d.ref)));
    // delete thread doc
    await deleteDoc(doc(db, `users/${userId}/threads/${threadId}`));
}

export async function enforceThreadLimit(userId, maxThreads = 10) {
    if (!userId) return [];
    const colRef = collection(db, `users/${userId}/threads`);
    const qAll = query(colRef, orderBy("updatedAt", "desc"));
    const allSnap = await getDocs(qAll);
    const docs = allSnap.docs;
    if (docs.length <= maxThreads) return [];
    const toDelete = docs.slice(maxThreads);
    const deletedIds = [];
    for (const d of toDelete) {
        await deleteThread(userId, d.id);
        deletedIds.push(d.id);
    }
    return deletedIds;
}


