import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(undefined); // undefined = cargando, null = sin sesión
  const [userRole, setUserRole] = useState(null);
  const [modulosActivos, setModulosActivos] = useState(null);
  const [tenantId, setTenantId] = useState(null);

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u || null);
      if (u) {
        let miTenantId = null;
        try {
          const snap = await getDoc(doc(db, 'Usuarios', u.uid));
          setUserRole(snap.exists() ? snap.data().role : null);
          // Retrocompatible: si el usuario aún no tiene tenantId asignado
          // (usuarios creados antes de esta migración), se asume Ciudad Real.
          miTenantId = (snap.exists() && snap.data().tenantId) || 'ciudad-real';
        } catch {
          setUserRole(null);
        }
        setTenantId(miTenantId);

        if (miTenantId) {
          try {
            const clubSnap = await getDoc(doc(db, 'clubes', miTenantId));
            setModulosActivos(clubSnap.exists() && clubSnap.data().modulosActivos ? clubSnap.data().modulosActivos : null);
          } catch {
            setModulosActivos(null);
          }
        }
      } else {
        setUserRole(null);
        setModulosActivos(null);
        setTenantId(null);
      }
    });
    return unsub;
  }, []);

  const value = {
    currentUser,
    userRole,
    modulosActivos,
    tenantId,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}