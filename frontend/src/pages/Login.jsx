import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate('/', { replace: true }); }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(''); setOk('');
    if (!email || !senha) { setErro('Preencha email e senha.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErro('Email inválido.'); return; }
    if (senha.length < 6) { setErro('A senha precisa ter ao menos 6 caracteres.'); return; }
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, senha);
      } else {
        await register(email, senha);
        setOk('Conta criada com sucesso!');
      }
      navigate('/', { replace: true });
    } catch (err) {
      setErro(err.message || 'Erro ao processar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ec-auth-bg d-flex align-items-center justify-content-center min-vh-100 p-3">
      <div className="ec-card card shadow-lg p-4" style={{ maxWidth: 440, width: '100%' }}>
        <div className="text-center mb-3">
          <div className="ec-logo">♻️</div>
          <h2 className="ec-title">EcoDrop</h2>
          <p className="text-secondary m-0">Recicle, divirta-se, salve o planeta!</p>
        </div>

        <ul className="nav nav-pills nav-justified mb-3 ec-tabs">
          <li className="nav-item">
            <button type="button" className={`nav-link ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setErro(''); setOk(''); }}>
              Entrar
            </button>
          </li>
          <li className="nav-item">
            <button type="button" className={`nav-link ${tab === 'cadastro' ? 'active' : ''}`} onClick={() => { setTab('cadastro'); setErro(''); setOk(''); }}>
              Cadastro
            </button>
          </li>
        </ul>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="voce@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Senha</label>
            <input type="password" className="form-control" placeholder="Mínimo 6 caracteres" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete={tab === 'login' ? 'current-password' : 'new-password'} required />
          </div>

          {erro && <div className="alert alert-danger py-2" role="alert">{erro}</div>}
          {ok && <div className="alert alert-success py-2" role="status">{ok}</div>}

          <button type="submit" className="btn btn-success w-100 ec-btn-primary" disabled={loading}>
            {loading ? 'Aguarde…' : tab === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  );
}