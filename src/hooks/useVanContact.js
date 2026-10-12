import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Keep private contact separate from the slower public listing/profile fetch.
// A result is usable only for the listing and verified viewer who requested it.
export default function useVanContact(vanId, currentUser) {
  const [result, setResult] = useState(null);
  const viewerId = currentUser?.emailVerified ? currentUser.uid : null;

  useEffect(() => {
    setResult(null);
    if (!vanId || !viewerId) return;
    let cancelled = false;
    getDoc(doc(db, 'vans', vanId, 'private', 'contact'))
      .then((snap) => {
        if (!cancelled && snap.exists()) {
          setResult({ vanId, viewerId, contact: snap.data() || {} });
        }
      })
      .catch(() => { /* Access remains subject to Firestore rules. */ });
    return () => { cancelled = true; };
  }, [vanId, viewerId]);

  return viewerId && result?.vanId === vanId && result?.viewerId === viewerId
    ? result.contact : null;
}
