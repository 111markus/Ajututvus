import { useState } from "react";

export default function TeacherLogin({ onLogin, error }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm card-rgb"
      >
        <h1 className="text-4xl text-center mb-2">🎓</h1>
        <h2 className="text-xl font-bold text-center text-white mb-6">
          Õpetaja sisselogimine
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Kasutajanimi
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kasutajanimi"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Parool
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parool"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-600 text-white text-lg font-semibold py-3 rounded-xl hover:bg-cyan-500 transition shadow-lg shadow-cyan-600/30"
          >
            Logi sisse
          </button>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
        </div>
      </form>
    </div>
  );
}
