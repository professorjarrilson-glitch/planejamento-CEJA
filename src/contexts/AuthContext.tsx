import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export type Role = "admin" | "professor";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: Role;
  subject?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Try to get the profile, maybe with a small retry logic if not found immediately
        let userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          // Force admin role for the specific requested email
          if (user.email === 'professorjarrilson@gmail.com' && data.role !== 'admin') {
            const updatedProfile = { ...data, role: 'admin' as Role };
            await setDoc(doc(db, "users", user.uid), updatedProfile, { merge: true });
            setProfile(updatedProfile);
          } else {
            setProfile(data);
          }
        } else {
          const isAdminUser = user.email === 'professorjarrilson@gmail.com';
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || "",
            name: user.displayName || "Usuário",
            role: isAdminUser ? "admin" : "professor",
          };
          await setDoc(doc(db, "users", user.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin: profile?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
