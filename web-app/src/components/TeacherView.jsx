export default function TeacherView({
  roomCode,
  roomData,
  timerValue,
  totalRounds,
  setTotalRounds,
  createRoom,
  startGame,
  startNextRound,
  nextQuestion,
  endGame,
  deleteRoom,
  teacherLogout,
  kickPlayer,
  error,
}) {
  // ---- No room yet ----
  if (!roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-game p-4">
        <div className="neon-glass rounded-3xl glow-purple p-8 w-full max-w-md text-center fade-in">
          <div className="text-5xl mb-3">🎮</div>
          <h1 className="text-2xl font-black text-white mb-1">GAMEMASTER</h1>
          <p className="text-white/30 text-sm mb-8 uppercase tracking-widest">Loo uus mängutuba</p>

          <div className="mb-8">
            <label className="block text-xs font-bold text-white/50 mb-3 uppercase tracking-wider">Roundide arv</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setTotalRounds(n)}
                  className={`btn-neon px-5 py-2.5 rounded-xl font-black text-lg ${
                    totalRounds === n
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white glow-purple"
                      : "bg-white/5 text-white/40 border border-white/10 hover:border-purple-500/50"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={createRoom}
            className="btn-neon w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold py-4 rounded-xl glow-purple mb-4"
          >
            ⚡ LOO UUS TUBA
          </button>
          <button onClick={teacherLogout} className="text-white/20 text-sm hover:text-white/40 transition">
            Logi välja
          </button>
          {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  const players = roomData?.players ? Object.entries(roomData.players) : [];
  const status = roomData?.status || "lobby";
  const currentQ = roomData?.questions?.[roomData?.currentQuestionIndex || 0];
  const totalQ = roomData?.totalQuestions || 6;
  const currentQIdx = (roomData?.currentQuestionIndex || 0) + 1;
  const pairs = roomData?.pairs ? Object.entries(roomData.pairs) : [];
  const answers = roomData?.answers?.[("q" + (roomData?.currentQuestionIndex || 0))];
  const currentRound = roomData?.currentRound || 1;
  const maxRounds = roomData?.totalRounds || totalRounds;
  const readyPlayers = roomData?.readyPlayers || {};
  const readyCount = Object.keys(readyPlayers).length;
  const totalPlayers = players.length;

  const timerClass = timerValue <= 10 ? "timer-ring timer-danger" : "timer-ring";
  const timerColor = timerValue <= 5 ? "text-red-400" : timerValue <= 10 ? "text-amber-400" : "text-neon-purple";

  // ---- LOBBY ----
  if (status === "lobby") {
    return (
      <div className="min-h-screen bg-game p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white font-bold text-lg">🎮 GAMEMASTER</h2>
            <button onClick={teacherLogout} className="text-white/20 text-sm hover:text-white/40 transition">Logi välja</button>
          </div>

          {/* Room code */}
          <div className="neon-glass rounded-3xl glow-purple p-8 text-center mb-6 fade-in">
            <p className="text-xs text-white/30 mb-2 uppercase tracking-widest font-bold">Toa kood</p>
            <div className="text-7xl font-black tracking-widest text-gradient-neon mb-3 font-mono">{roomCode}</div>
            <p className="text-white/30 text-sm">Jaga seda koodi mängijatega</p>
            <p className="text-purple-400/60 text-xs mt-2 font-medium">
              {maxRounds} {maxRounds === 1 ? "round" : "roundi"} × 6 küsimust
            </p>
          </div>

          {/* Players with KICK */}
          <div className="neon-glass rounded-3xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">MÄNGIJAD ({players.length})</h3>
            {players.length === 0 ? (
              <p className="text-white/20 text-center py-4">Ootame mängijaid...</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {players.map(([uid, player]) => (
                  <div key={uid} className="neon-glass-light rounded-2xl p-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl">👤</span>
                      <span className="font-medium text-white/80 text-sm truncate">{player.name}</span>
                    </div>
                    <button
                      onClick={() => kickPlayer(uid)}
                      className="btn-kick shrink-0 bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-lg border border-red-500/30"
                      title="Eemalda mängija"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={startGame}
            disabled={players.length < 2}
            className={`btn-neon w-full text-lg font-bold py-4 px-6 rounded-2xl ${
              players.length >= 2
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white glow-green"
                : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
            }`}
          >
            {players.length < 2
              ? "VAJA VÄHEMALT 2 MÄNGIJAT (" + players.length + ")"
              : "🚀 ALUSTA MÄNGU (" + players.length + " mängijat)"}
          </button>
          {error && <p className="mt-4 text-red-400 text-center text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  // ---- PLAYING ----
  if (status === "playing") {
    return (
      <div className="min-h-screen bg-game p-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-2">
            <span className="text-white/30 text-sm font-bold uppercase tracking-widest">
              Round {currentRound} / {maxRounds}
            </span>
          </div>

          {/* Timer */}
          <div className="text-center mb-8">
            <div className={timerClass}>
              <div className={`text-8xl font-black font-mono ${timerColor} transition-colors duration-500`}>
                {timerValue}
              </div>
            </div>
            <p className="text-white/20 text-sm mt-4">sekundit</p>
          </div>

          {/* Question */}
          <div className="neon-glass rounded-3xl glow-purple p-8 text-center mb-6 fade-in">
            <p className="text-xs text-white/30 mb-3 uppercase tracking-widest font-bold">
              Küsimus {currentQIdx} / {totalQ}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">{currentQ}</p>
          </div>

          {/* Pairs */}
          <div className="neon-glass rounded-3xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">PAARID</h3>
            <div className="grid gap-3">
              {pairs.map(([pairKey, pair]) => {
                const members = Object.entries(pair.members || {});
                const pairAnswer = answers?.[pairKey];
                return (
                  <div
                    key={pairKey}
                    className={`rounded-2xl p-4 transition-all border ${
                      pairAnswer
                        ? "border-green-500/30 bg-green-500/10 glow-green"
                        : "border-white/5 bg-white/5"
                    }`}
                  >
                    <div className="flex flex-wrap gap-2 mb-1">
                      {members.map(([uid, m]) => (
                        <span
                          key={uid}
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            m.role === "kysija"
                              ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          }`}
                        >
                          {m.role === "kysija" ? "❓" : "💬"} {m.name}
                        </span>
                      ))}
                    </div>
                    {pairAnswer && (
                      <p className="text-sm text-green-400/80 mt-2 italic">✅ "{pairAnswer.answer}"</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={nextQuestion}
              className="btn-neon flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold py-3 px-6 rounded-2xl glow-purple"
            >
              JÄRGMINE →
            </button>
            <button
              onClick={endGame}
              className="btn-neon bg-red-600/80 text-white font-bold py-3 px-6 rounded-2xl glow-red"
            >
              LÕPETA
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- ROUND END ----
  if (status === "round_end") {
    return (
      <div className="min-h-screen bg-game p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4 float">🔄</div>
          <h2 className="text-3xl font-black text-white mb-2">ROUND {currentRound - 1} LÕPPES!</h2>
          <p className="text-white/40 mb-6">
            Mängijad otsivad uut partnerit... ({readyCount}/{totalPlayers} valmis)
          </p>

          <div className="neon-glass rounded-3xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">UUED PAARID (Round {currentRound})</h3>
            <div className="grid gap-3">
              {pairs.map(([pairKey, pair]) => {
                const members = Object.entries(pair.members || {});
                const pairStarted = pair.started;
                return (
                  <div key={pairKey} className={`rounded-2xl p-3 border ${
                    pairStarted ? "border-green-500/30 bg-green-500/10" : "border-white/5 bg-white/5"
                  }`}>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {members.map(([uid, m]) => {
                        const isReady = readyPlayers[uid];
                        return (
                          <span
                            key={uid}
                            className={`text-sm px-3 py-1 rounded-full font-medium ${
                              isReady
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-white/5 text-white/30 border border-white/10"
                            }`}
                          >
                            {isReady ? "✅" : "⏳"} {m.name}
                          </span>
                        );
                      })}
                    </div>
                    {pairStarted && <p className="text-green-400/60 text-xs mt-1">▶ Alustatud!</p>}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={startNextRound}
            className="btn-neon w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold py-4 rounded-2xl glow-green mb-3"
          >
            🚀 SUNDKÄIVITA ROUND {currentRound}
          </button>
          <p className="text-white/20 text-xs">Vajuta kui soovid kõigile korraga alustada</p>
        </div>
      </div>
    );
  }

  // ---- FINISHED ----
  return (
    <div className="min-h-screen flex items-center justify-center bg-game p-4">
      <div className="neon-glass rounded-3xl glow-purple p-8 w-full max-w-md text-center fade-in">
        <div className="text-7xl mb-4 float">🎉</div>
        <h2 className="text-3xl font-black text-white mb-2">MÄNG LÄBI!</h2>
        <p className="text-white/40 mb-6">
          {maxRounds} {maxRounds === 1 ? "round" : "roundi"} mängitud. Aitäh!
        </p>
        <button
          onClick={deleteRoom}
          className="btn-neon w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-2xl glow-purple mb-3"
        >
          LOO UUS MÄNG
        </button>
        <button onClick={teacherLogout} className="text-white/20 text-sm hover:text-white/40 transition">
          Logi välja
        </button>
      </div>
    </div>
  );
}
