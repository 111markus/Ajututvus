import { useState } from "react";

export default function TeacherLogin({ onLogin, onBack, error }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="glass rounded-3xl shadow-sm p-8 w-full max-w-sm fade-in"
      >
        <div className="text-4xl text-center mb-2">🎮</div>
        <h2 className="text-xl font-bold text-center text-slate-800 mb-6">
          Gamemaster sisselogimine
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Kasutajanimi
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kasutajanimi"
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder-slate-400 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Parool
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parool"
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder-slate-400 shadow-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white text-lg font-semibold py-3 rounded-xl hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-indigo-200"
          >
            Logi sisse
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-slate-500 text-sm font-medium hover:text-slate-700 transition py-2"
          >
            ← Tagasi
          </button>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
        </div>
      </form>
    </div>
  );
}
