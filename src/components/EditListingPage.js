import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { canEditVan } from '../utils/adminHelper';
import AddVanForm from './AddVanForm';
import AuthModal from './AuthModal';

export default function EditListingPage({ vanId, focusPlate = false }) {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [result, setResult] = useState({ loading: true });
  const uid = currentUser?.uid;
  const admin = currentUser?.isAdmin === true;
  const verified = currentUser?.emailVerified === true;

  useEffect(() => {
    document.getElementById('app-loader')?.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!uid) return;
    setResult({ loading: true });
    const load = async () => {
      try {
        if (!/^[a-zA-Z0-9_-]{1,128}$/.test(vanId || '')) throw new Error('missing');
        if (!verified) throw new Error('verify');
        const snapshot = await getDoc(doc(db, 'vans', vanId));
        if (!snapshot.exists()) throw new Error('missing');
        const van = { ...snapshot.data(), id: snapshot.id };
        if (!canEditVan({ uid, isAdmin: admin }, van)) throw new Error('denied');
        if (!cancelled) setResult({ van, loading: false });
      } catch (error) {
        const reason = ['missing', 'verify', 'denied'].includes(error.message) ? error.message : 'load_error';
        if (!cancelled) setResult({ error: reason, loading: false });
      }
    };
    load();
    return () => { cancelled = true; };
  }, [vanId, uid, admin, verified]);

  const close = () => navigate('/my-listings');
  if (!uid) return <AuthModal isOpen onClose={close} />;
  if (result.loading || result.error) return <main className="max-w-xl mx-auto p-8 text-center">
    <p role={result.error ? 'alert' : 'status'}>{t(`edit_listing.${result.error || 'loading'}`)}</p>
    <Link to="/my-listings" className="inline-block mt-4 underline">{t('edit_listing.back')}</Link>
  </main>;
  return <AddVanForm key={vanId} van={result.van} isEditMode focusPlate={focusPlate} onClose={close} />;
}
