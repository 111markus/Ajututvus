import { useState } from "react";

export default function TeacherLogin({ onLogin, onBack, error }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-game p-4">
      <form
        onSubmit={handleSubmit}
        className="neon-glass rounded-3xl glow-purple p-8 w-full max-w-sm fade-in"
      >
        <div className="text-4xl text-center mb-2">🔐</div>
        <h2 className="text-xl font-bold text-center text-white mb-1">
          GAMEMASTER
        </h2>
        <p className="text-center text-white/30 text-sm mb-2 uppercase tracking-widest">
          Sisselogimine
        </p>
        <p className="text-center text-white/60 text-xs mb-8 bg-white/5 py-2 rounded-lg">
          Testimiseks: <b>Opetaja</b> / <b>Voco123</b>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">
              Kasutajanimi
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kasutajanimi"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 placeholder-white/20 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">
              Parool
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parool"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 placeholder-white/20 transition"
            />
          </div>

          <button
            type="submit"
            className="btn-neon w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold py-3.5 rounded-xl glow-purple"
          >
            LOGI SISSE
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-white/30 text-sm font-medium hover:text-white/60 transition py-2"
          >
            ← Tagasi
          </button>

          {error && (
            <p className="text-red-400 text-center text-sm font-medium glow-red rounded-lg p-2">
              {error}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
