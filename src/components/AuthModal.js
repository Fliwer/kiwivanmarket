import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { TermsOfServiceModal } from './TermsOfService';

const AuthModal = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resendVerificationEmail } = useAuth();
  
  const [mode, setMode] = useState('signin'); // 'signin' ou 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ✅ État pour afficher l'écran de vérification email
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailResent, setEmailResent] = useState(false);
  const [tempPassword, setTempPassword] = useState(''); // Pour permettre resend
  
  // Terms state
  const [showTerms, setShowTerms] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Vérifier si l'utilisateur a déjà accepté les terms
  const hasAcceptedTerms = () => {
    return localStorage.getItem('kiwivanmarket_terms_accepted') === 'true';
  };

  // Sauvegarder l'acceptation des terms
  const saveTermsAcceptance = () => {
    localStorage.setItem('kiwivanmarket_terms_accepted', 'true');
    localStorage.setItem('kiwivanmarket_terms_date', new Date().toISOString());
  };

  if (!isOpen) return null;

  // Exécuter l'action après acceptation des terms
  const executeAfterTerms = async (action) => {
    if (hasAcceptedTerms()) {
      await action();
    } else {
      setPendingAction(() => action);
      setShowTerms(true);
    }
  };

  // Quand les terms sont acceptés
  const handleTermsAccepted = async () => {
    saveTermsAcceptance();
    setShowTerms(false);
    if (pendingAction) {
      await pendingAction();
      setPendingAction(null);
    }
  };

  // Connexion avec Google
  const handleGoogleSignIn = async () => {
    const action = async () => {
      try {
        setError('');
        setLoading(true);
        await signInWithGoogle();
        onClose();
      } catch (error) {
        setError('Erreur lors de la connexion avec Google');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    await executeAfterTerms(action);
  };

  // Connexion avec Email - ✅ Gère le cas email non vérifié
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    const action = async () => {
      try {
        setError('');
        setLoading(true);
        await signInWithEmail(email, password);
        onClose();
      } catch (error) {
        // ✅ Cas spécial : email non vérifié
        if (error.code === 'auth/email-not-verified') {
          setRegisteredEmail(error.email || email);
          setShowVerifyEmail(true);
        } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          setError('Invalid email or password');
        } else {
          setError('Error signing in. Please try again.');
        }
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    await executeAfterTerms(action);
  };

  // Inscription avec Email - ✅ AFFICHE L'ÉCRAN DE VÉRIFICATION
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    const action = async () => {
      try {
        setError('');
        setLoading(true);
        await signUpWithEmail(email, password, displayName);
        
        // ✅ Ne pas fermer le modal - afficher l'écran de vérification
        setRegisteredEmail(email);
        setTempPassword(password); // Stocker pour permettre resend
        setShowVerifyEmail(true);
        
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          setError('This email is already in use');
        } else if (error.code === 'auth/weak-password') {
          setError('Password must be at least 6 characters');
        } else {
          setError('Error during registration');
        }
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    await executeAfterTerms(action);
  };

  // Nettoyer et fermer le modal
  const handleClose = () => {
    setTempPassword(''); // Sécurité : ne pas garder le mot de passe
    setShowVerifyEmail(false);
    setRegisteredEmail('');
    setEmailResent(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
          {/* Bouton fermer */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>

          {/* ✅ ÉCRAN DE VÉRIFICATION EMAIL */}
          {showVerifyEmail ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={40} className="text-emerald-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verify your email 📧
              </h2>
              
              <p className="text-gray-600 mb-4">
                We sent a verification link to:
              </p>
              
              <p className="font-semibold text-emerald-600 text-lg mb-6 bg-emerald-50 py-2 px-4 rounded-lg inline-block">
                {registeredEmail}
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-left">
                <p className="text-blue-800 text-sm font-medium mb-2">
                  📋 Next steps:
                </p>
                <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                  <li>Check your inbox</li>
                  <li>Click the verification link</li>
                  <li>Come back here and sign in</li>
                </ol>
              </div>
              
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-4 flex items-center gap-3">
                <span className="text-2xl">📂</span>
                <p className="text-amber-800 text-sm">
                  <strong>Can't find it?</strong> Check your <strong>Spam</strong> or <strong>Junk</strong> folder!
                </p>
              </div>
              
              {emailResent ? (
                <p className="text-emerald-600 text-sm font-medium mb-4 flex items-center justify-center gap-2">
                  ✓ New verification email sent!
                </p>
              ) : (
                <button
                  onClick={async () => {
                    setResendingEmail(true);
                    try {
                      // Se reconnecter temporairement pour renvoyer l'email
                      const { signInWithEmailAndPassword, sendEmailVerification, signOut } = await import('firebase/auth');
                      const { auth } = await import('../firebase');
                      
                      // On utilise le mot de passe stocké temporairement
                      if (tempPassword) {
                        const result = await signInWithEmailAndPassword(auth, registeredEmail, tempPassword);
                        await sendEmailVerification(result.user, {
                          url: window.location.origin,
                          handleCodeInApp: false
                        });
                        await signOut(auth);
                        setEmailResent(true);
                        setTimeout(() => setEmailResent(false), 10000);
                      } else {
                        // Si pas de mot de passe, demander de se reconnecter
                        setError('Please sign in again to resend the verification email');
                      }
                    } catch (err) {
                      console.error('Resend error:', err);
                      if (err.code === 'auth/too-many-requests') {
                        setError('Too many attempts. Please wait a few minutes.');
                      } else {
                        setError('Failed to resend email. Please try again.');
                      }
                    } finally {
                      setResendingEmail(false);
                    }
                  }}
                  disabled={resendingEmail}
                  className="text-emerald-600 text-sm font-medium hover:underline mb-4 disabled:opacity-50"
                >
                  {resendingEmail ? 'Sending...' : "Didn't receive it? Click to resend"}
                </button>
              )}
              
              <button
                onClick={() => {
                  setShowVerifyEmail(false);
                  setMode('signin');
                  setEmail(registeredEmail);
                  setPassword('');
                }}
                className="w-full bg-emerald-600 text-white rounded-lg py-3 font-medium hover:bg-emerald-700 transition-colors"
              >
                I've verified, let me sign in
              </button>
              
              <p className="text-gray-400 text-xs mt-4">
                Already verified? Click the button above to sign in.
              </p>
            </div>
          ) : (
            <>
              {/* Titre */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'signin' ? 'Welcome back!' : 'Create account'}
          </h2>
          <p className="text-gray-600 mb-6">
            {mode === 'signin' 
              ? 'Sign in to continue to Kiwi Van Market' 
              : 'Join Kiwi Van Market today'}
          </p>

          {/* Erreur */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Bouton Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors mb-4 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>

          {/* Séparateur */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Formulaire Email/Password */}
          <form onSubmit={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp}>
            {/* Nom (seulement pour inscription) */}
            {mode === 'signup' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
              )}
            </div>

            {/* Bouton Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white rounded-lg py-3 font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{mode === 'signup' ? 'Creating account...' : 'Signing in...'}</span>
                </>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Sign Up'
              )}
            </button>
          </form>

          {/* Toggle Sign In / Sign Up */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError('');
                }}
                className="text-emerald-600 font-medium hover:underline"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Terms notice */}
          <p className="text-xs text-gray-400 text-center mt-4">
            By continuing, you agree to our{' '}
            <button 
              onClick={() => setShowTerms(true)}
              className="text-emerald-600 hover:underline"
            >
              Terms of Use
            </button>
          </p>
            </>
          )}
        </div>
      </div>

      {/* Terms Modal */}
      <TermsOfServiceModal 
        isOpen={showTerms}
        onClose={() => {
          setShowTerms(false);
          setPendingAction(null);
        }}
        onAccept={handleTermsAccepted}
      />
    </>
  );
};

export default AuthModal;