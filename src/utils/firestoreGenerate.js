import { db } from "../config/Firebase";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    serverTimestamp,
} from "firebase/firestore";


export async function startGeneration(prompt, extraFields = {}) {
    if (!prompt || typeof prompt !== "string") {
        throw new Error("prompt must be a non-empty string");
    }

    const colRef = collection(db, "generate");
    const docRef = await addDoc(colRef, {
        prompt,
        createTime: serverTimestamp(),
        ...extraFields,
    });
    return docRef;
}


export function waitForResponse(docRef, { timeoutMs = 90000 } = {}) {
    return new Promise((resolve, reject) => {
        let timeoutId;

        const unsubscribe = onSnapshot(
            docRef,
            (snap) => {
                if (!snap.exists()) return;
                const data = snap.data();

                if (data?.error) {
                    clearTimeout(timeoutId);
                    unsubscribe();
                    reject(new Error(String(data.error)));
                    return;
                }

                if (data?.response || data?.candidates) {
                    clearTimeout(timeoutId);
                    unsubscribe();
                    resolve({ response: data.response, candidates: data.candidates, snapshot: snap });
                }
            },
            (err) => {
                clearTimeout(timeoutId);
                unsubscribe();
                reject(err);
            }
        );

        timeoutId = setTimeout(async () => {
            try {
                const latest = await getDoc(docRef);
                const data = latest.data();
                if (data?.response || data?.candidates) {
                    unsubscribe();
                    resolve({ response: data.response, candidates: data.candidates, snapshot: latest });
                } else {
                    unsubscribe();
                    reject(new Error("Timed out waiting for AI response"));
                }
            } catch (e) {
                unsubscribe();
                reject(e);
            }
        }, timeoutMs);
    });
}


export async function generateWithFirestore(prompt, extraFields = {}, options = {}) {
    const ref = await startGeneration(prompt, extraFields);
    const result = await waitForResponse(ref, options);
    return { id: ref.id, ...result };
}


