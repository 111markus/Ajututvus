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
  error,
}) {
  // ---- Room not created yet ----
  if (!roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 p-4">
        <div className="glass rounded-3xl shadow-sm p-8 w-full max-w-md text-center fade-in">
          <div className="text-4xl mb-2">🎮</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Gamemaster paneel
          </h1>
          <p className="text-slate-500 text-sm mb-8">Loo uus mängutuba</p>

          {/* Rounds selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-600 mb-3">
              Roundide arv
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setTotalRounds(n)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                    totalRounds === n
                      ? "bg-indigo-500 text-white shadow-md shadow-indigo-200"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 shadow-sm"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={createRoom}
            className="w-full bg-indigo-500 text-white text-lg font-semibold py-3.5 rounded-xl hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-indigo-200 mb-4"
          >
            Loo uus tuba
          </button>
          <button
            onClick={teacherLogout}
            className="text-slate-400 text-sm font-medium hover:text-slate-600 transition"
          >
            Logi välja
          </button>
          {error && <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>}
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

  // Timer aura class
  const timerAura = timerValue <= 10 ? "timer-aura timer-aura-warm" : "timer-aura";
  const timerColor = timerValue <= 5 ? "text-orange-500" : timerValue <= 10 ? "text-amber-500" : "text-indigo-600";

  // ---- LOBBY ----
  if (status === "lobby") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-slate-800 text-lg font-semibold">🎮 Gamemaster</h2>
            <button
              onClick={teacherLogout}
              className="text-slate-400 text-sm font-medium hover:text-slate-600 transition"
            >
              Logi välja
            </button>
          </div>

          {/* Room code */}
          <div className="glass rounded-3xl shadow-sm p-8 text-center mb-6 fade-in">
            <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest font-semibold">Toa kood</p>
            <div className="text-6xl font-mono font-extrabold tracking-widest text-gradient mb-3">
              {roomCode}
            </div>
            <p className="text-slate-400 text-sm">Jaga seda koodi mängijatega</p>
            <p className="text-indigo-400 text-xs mt-2 font-medium">
              {maxRounds} {maxRounds === 1 ? "round" : "roundi"} × 6 küsimust
            </p>
          </div>

          {/* Players */}
          <div className="glass rounded-3xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Mängijad ({players.length})
            </h3>
            {players.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Ootame mängijaid...</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {players.map(([uid, player]) => (
                  <div key={uid} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-slate-100">
                    <span className="text-2xl">👤</span>
                    <p className="font-medium text-slate-700 mt-1 text-sm">{player.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Start */}
          <button
            onClick={startGame}
            disabled={players.length < 2}
            className={`w-full text-lg font-semibold py-4 px-6 rounded-2xl transition-all duration-200 ${
              players.length >= 2
                ? "bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 active:scale-95 shadow-md shadow-emerald-200"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {players.length < 2
              ? ("Vaja vähemalt 2 mängijat (praegu " + players.length + ")")
              : ("🚀 Alusta mängu (" + players.length + " mängijat)")}
          </button>

          {error && <p className="mt-4 text-red-500 text-center text-sm font-medium">{error}</p>}
        </div>
      </div>
    );
  }

  // ---- PLAYING ----
  if (status === "playing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 p-4">
        <div className="max-w-3xl mx-auto">
          {/* Round */}
          <div className="text-center mb-2">
            <span className="text-indigo-400 text-sm font-semibold uppercase tracking-wider">
              Round {currentRound} / {maxRounds}
            </span>
          </div>

          {/* Timer with aura */}
          <div className="text-center mb-8">
            <div className={timerAura}>
              <div className={`text-7xl font-extrabold font-mono ${timerColor} transition-colors duration-700`}>
                {timerValue}
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-3">sekundit</p>
          </div>

          {/* Question */}
          <div className="glass rounded-3xl shadow-sm p-8 text-center mb-6 fade-in">
            <p className="text-xs text-slate-400 mb-3 uppercase tracking-widest font-semibold">
              Küsimus {currentQIdx} / {totalQ}
            </p>
            <p className="text-xl sm:text-2xl font-semibold text-slate-800 leading-relaxed">
              {currentQ}
            </p>
          </div>

          {/* Pairs */}
          <div className="glass rounded-3xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Paarid</h3>
            <div className="grid gap-3">
              {pairs.map(([pairKey, pair]) => {
                const members = Object.entries(pair.members || {});
                const pairAnswer = answers?.[pairKey];
                return (
                  <div
                    key={pairKey}
                    className={`rounded-2xl p-4 transition-all border ${
                      pairAnswer
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-100 bg-white"
                    } shadow-sm`}
                  >
                    <div className="flex flex-wrap gap-2 mb-1">
                      {members.map(([uid, m]) => (
                        <span
                          key={uid}
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            m.role === "kysija"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-violet-100 text-violet-700 border border-violet-200"
                          }`}
                        >
                          {m.role === "kysija" ? "❓" : "💬"} {m.name}
                        </span>
                      ))}
                    </div>
                    {pairAnswer && (
                      <p className="text-sm text-emerald-600 mt-2 italic">
                        ✅ &quot;{pairAnswer.answer}&quot;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={nextQuestion}
              className="flex-1 bg-indigo-500 text-white text-lg font-semibold py-3 px-6 rounded-2xl hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-indigo-200"
            >
              Järgmine küsimus →
            </button>
            <button
              onClick={endGame}
              className="bg-rose-500 text-white font-semibold py-3 px-6 rounded-2xl hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-200"
            >
              Lõpeta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- ROUND END ----
  if (status === "round_end") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-4 float">🔄</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Round {currentRound - 1} lõppes!
          </h2>
          <p className="text-slate-500 mb-6">
            Mängijad otsivad uut partnerit... ({readyCount}/{totalPlayers} valmis)
          </p>

          <div className="glass rounded-3xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Uued paarid (Round {currentRound})</h3>
            <div className="grid gap-3">
              {pairs.map(([pairKey, pair]) => {
                const members = Object.entries(pair.members || {});
                return (
                  <div key={pairKey} className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {members.map(([uid, m]) => {
                        const isReady = readyPlayers[uid];
                        return (
                          <span
                            key={uid}
                            className={`text-sm px-3 py-1 rounded-full font-medium ${
                              isReady
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            {isReady ? "✅" : "⏳"} {m.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={startNextRound}
            className="w-full bg-emerald-500 text-white text-lg font-semibold py-4 rounded-2xl hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-emerald-200 mb-3"
          >
            🚀 Alusta Round {currentRound}
          </button>
          <p className="text-slate-400 text-xs">Vajuta kui kõik on uue partneri leidnud</p>
        </div>
      </div>
    );
  }

  // ---- FINISHED ----
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 p-4">
      <div className="glass rounded-3xl shadow-sm p-8 w-full max-w-md text-center fade-in">
        <div className="text-6xl mb-4 float">🎉</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Mäng läbi!</h2>
        <p className="text-slate-500 mb-6">
          {maxRounds} {maxRounds === 1 ? "round" : "roundi"} mängitud. Aitäh!
        </p>
        <button
          onClick={deleteRoom}
          className="w-full bg-indigo-500 text-white font-semibold py-3 px-6 rounded-2xl hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-indigo-200 mb-3"
        >
          Loo uus mäng
        </button>
        <button
          onClick={teacherLogout}
          className="text-slate-400 text-sm font-medium hover:text-slate-600 transition"
        >
          Logi välja
        </button>
      </div>
    </div>
  );
}
