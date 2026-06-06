import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  const nome = user?.email?.split('@')[0] || 'Jogador';

  return (
    <div className="ec-home-bg min-vh-100 d-flex flex-column">
      <nav className="d-flex justify-content-between align-items-center p-3">
        <span className="ec-title fs-4 m-0">EcoDrop ♻️</span>
        <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Sair</button>
      </nav>

      <main className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center px-3">
        <div className="ec-card card shadow-lg p-4 p-md-5" style={{ maxWidth: 560 }}>
          <h2 className="mb-1">Olá, <span className="text-success">{nome}</span>! 👋</h2>
          <p className="text-secondary mb-3">Pronto para reciclar?</p>

          <div className="ec-record mb-4">
            <span className="ec-record-label">Seu recorde</span>
            <span className="ec-record-value">{user?.record ?? 0}</span>
            <span className="ec-record-unit">pontos</span>
          </div>

          <button className="btn btn-success btn-lg ec-btn-primary mb-2" onClick={() => navigate('/jogar')}>
            Começar ♻️
          </button>

          <button className="btn btn-link" onClick={() => setShowHelp((s) => !s)}>
            {showHelp ? 'Ocultar ajuda' : 'Como jogar?'}
          </button>

          {showHelp && (
            <div className="alert alert-info text-start mt-2 mb-0">
              <strong>Objetivo:</strong> mover a lixeira para pegar apenas itens recicláveis (papel, plástico, vidro, etc).<br />
              <strong>Cuidado:</strong> pegar itens não recicláveis encerra o jogo!<br />
              <strong>Controles:</strong> ◀ ▶ teclas, mouse ou arrasto na tela.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}