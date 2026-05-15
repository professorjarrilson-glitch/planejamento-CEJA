import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { BookOpen, Loader2, Lock, Mail, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const isAdmin = user.email === 'professorjarrilson@gmail.com';
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          name: user.displayName || 'Usuário',
          role: isAdmin ? 'admin' : 'professor',
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('O login por Google não está ativado no seu projeto Firebase. Ative-o em Authentication > Sign-in method no Console do Firebase.');
      } else {
        setError('Erro ao entrar com Google. Verifique se o pop-up foi bloqueado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isSpecialAdmin = email === 'admin';
      const isBootstrapAdmin = isSpecialAdmin && password === 'admin123';
      const finalEmail = isSpecialAdmin ? 'admin@cejampm.com' : email;
      const finalPassword = password;

      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, finalEmail, finalPassword);
        const isAdmin = finalEmail === 'professorjarrilson@gmail.com';
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: finalEmail,
          name,
          role: isAdmin ? 'admin' : 'professor',
          createdAt: new Date().toISOString()
        });
      } else {
        if (isBootstrapAdmin) {
          try {
            await signInWithEmailAndPassword(auth, finalEmail, finalPassword);
          } catch (e: any) {
            if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
              const cred = await createUserWithEmailAndPassword(auth, finalEmail, finalPassword);
              await setDoc(doc(db, 'users', cred.user.uid), {
                uid: cred.user.uid,
                email: finalEmail,
                name: 'Administrador',
                role: 'admin',
                createdAt: new Date().toISOString()
              });
            } else {
              throw e;
            }
          }
        } else {
          await signInWithEmailAndPassword(auth, finalEmail, finalPassword);
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('O login por E-mail/Senha não está ativado no seu projeto Firebase. Ative-lo no Console do Firebase ou use o botão "Entrar com Google" (se ativado).');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Usuário ou senha incorretos.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Erro ao acessar o sistema. Tente o login com Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[32px] shadow-2xl shadow-brand-orange/5 overflow-hidden border border-slate-100">
          <div className="bg-white p-12 flex flex-col items-center justify-center text-center border-b border-slate-50">
            <motion.div 
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="w-32 h-32 mb-8"
            >
              <img src="/logo_ceja.png" alt="Logo CEJA" className="w-full h-full object-contain" />
            </motion.div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Planejamento CEJAMPM</h1>
            <p className="text-slate-400 mt-2 font-medium">Excelência em Gestão Pedagógica</p>
          </div>

          <div className="p-10 space-y-6">
            <form onSubmit={handleAuth} className="space-y-4">
              {isRegistering && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-orange outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail ou Usuário</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-orange outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
                    placeholder="ex: admin ou email@cejam.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-orange outline-none transition-all placeholder:text-slate-300 font-medium text-slate-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl border border-red-100"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-orange hover:brightness-95 text-white font-bold py-4 rounded-2xl shadow-xl shadow-brand-orange/20 transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? <Loader2 className="animate-spin" /> : <span>{isRegistering ? 'Criar Conta' : 'Acessar'}</span>}
              </button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Ou</span></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar com Google
            </button>

            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="w-full text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-brand-orange transition-colors"
            >
              {isRegistering ? 'Já tem conta? Entre' : 'Cadastre-se como professor'}
            </button>
          </div>
        </div>
        
        <p className="text-center text-slate-400 text-xs mt-8">
          © 2026 CEJAMPM • Todos os direitos reservados
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

