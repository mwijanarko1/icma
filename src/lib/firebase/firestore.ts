import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "./config";
import type { ChainSession, AnalysisSession, UserProfile } from "@/types/firebase";
import type { Chain } from "@/types/hadith";
import type { SelectedHadith, Step } from "@/types/analysis";

// Utility function to clean undefined values from objects before saving to Firestore
function cleanUndefinedValues<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedValues) as T;
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value);
      }
    }
    return cleaned;
  }

  return obj;
}

// Collection references
const chainSessionsCollection = collection(db, "chainSessions");
const analysisSessionsCollection = collection(db, "analysisSessions");
const usersCollection = collection(db, "users");

// User Profile Operations
// Note: These functions are kept for potential future use, but user profiles are not currently required
// Firebase Auth already provides all necessary user information (uid, email, displayName, photoURL)
export const createUserProfile = async (user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null }): Promise<void> => {
  const userRef = doc(usersCollection, user.uid);
  const now = Timestamp.now();

  const userProfile: Omit<UserProfile, "userId"> = {
    email: user.email || "",
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: now,
    updatedAt: now
  };

  await setDoc(userRef, userProfile, { merge: true });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(usersCollection, userId);
  const docSnap = await getDoc(userRef);
  
  if (docSnap.exists()) {
    return { userId: docSnap.id, ...docSnap.data() } as UserProfile;
  }
  return null;
};

// Chain Session Operations
export const saveChainSession = async (
  userId: string,
  sessionData: {
    name: string;
    hadithText: string;
    chains: Chain[];
    mermaidCode: string;
  },
  sessionId?: string
): Promise<string> => {
  const timestamp = serverTimestamp();

  // Clean undefined values from sessionData before saving
  const cleanedSessionData = cleanUndefinedValues(sessionData);

  if (sessionId) {
    // Update existing session
    const sessionRef = doc(chainSessionsCollection, sessionId);
    await updateDoc(sessionRef, {
      ...cleanedSessionData,
      updatedAt: timestamp
    });
    return sessionId;
  } else {
    // Create new session
    const sessionRef = doc(chainSessionsCollection);
    const newSession: Omit<ChainSession, "id"> = {
      userId,
      ...cleanedSessionData,
      createdAt: timestamp as Timestamp,
      updatedAt: timestamp as Timestamp
    };
    await setDoc(sessionRef, newSession);
    return sessionRef.id;
  }
};

export const getChainSession = async (sessionId: string): Promise<ChainSession | null> => {
  const sessionRef = doc(chainSessionsCollection, sessionId);
  const docSnap = await getDoc(sessionRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as ChainSession;
  }
  return null;
};

export const getUserChainSessions = async (userId: string): Promise<ChainSession[]> => {
  const q = query(
    chainSessionsCollection,
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ChainSession));
};

export const deleteChainSession = async (sessionId: string): Promise<void> => {
  const sessionRef = doc(chainSessionsCollection, sessionId);
  await deleteDoc(sessionRef);
};

export const updateChainSessionName = async (sessionId: string, name: string): Promise<void> => {
  const sessionRef = doc(chainSessionsCollection, sessionId);
  await updateDoc(sessionRef, {
    name,
    updatedAt: serverTimestamp()
  });
};

// Analysis Session Operations
export const saveAnalysisSession = async (
  userId: string,
  sessionData: {
    name: string;
    selectedHadiths: SelectedHadith[];
    activeStep: number;
    steps: Step[];
  },
  sessionId?: string
): Promise<string> => {
  const timestamp = serverTimestamp();

  // Clean undefined values from sessionData before saving
  const cleanedSessionData = cleanUndefinedValues(sessionData);

  if (sessionId) {
    // Update existing session
    const sessionRef = doc(analysisSessionsCollection, sessionId);
    await updateDoc(sessionRef, {
      ...cleanedSessionData,
      updatedAt: timestamp
    });
    return sessionId;
  } else {
    // Create new session
    const sessionRef = doc(analysisSessionsCollection);
    const newSession: Omit<AnalysisSession, "id"> = {
      userId,
      ...cleanedSessionData,
      createdAt: timestamp as Timestamp,
      updatedAt: timestamp as Timestamp
    };
    await setDoc(sessionRef, newSession);
    return sessionRef.id;
  }
};

export const getAnalysisSession = async (sessionId: string): Promise<AnalysisSession | null> => {
  const sessionRef = doc(analysisSessionsCollection, sessionId);
  const docSnap = await getDoc(sessionRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as AnalysisSession;
  }
  return null;
};

export const getUserAnalysisSessions = async (userId: string): Promise<AnalysisSession[]> => {
  const q = query(
    analysisSessionsCollection,
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as AnalysisSession));
};

export const deleteAnalysisSession = async (sessionId: string): Promise<void> => {
  const sessionRef = doc(analysisSessionsCollection, sessionId);
  await deleteDoc(sessionRef);
};

export const updateAnalysisSessionName = async (sessionId: string, name: string): Promise<void> => {
  const sessionRef = doc(analysisSessionsCollection, sessionId);
  await updateDoc(sessionRef, {
    name,
    updatedAt: serverTimestamp()
  });
};
