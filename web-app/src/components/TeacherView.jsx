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
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center card-rgb">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎮 Gamemaster paneel
          </h1>
          <p className="text-gray-400 mb-6">Loo uus mängutuba</p>

          {/* Rounds selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Roundide arv
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setTotalRounds(n)}
                  className={`px-5 py-2 rounded-xl font-bold text-lg transition ${
                    totalRounds === n
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30"
                      : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={createRoom}
            className="w-full bg-cyan-600 text-white text-lg font-semibold py-3 px-6 rounded-xl hover:bg-cyan-500 transition shadow-lg shadow-cyan-600/30 mb-4"
          >
            Loo uus tuba
          </button>
          <button
            onClick={teacherLogout}
            className="text-gray-500 text-sm underline hover:text-gray-300"
          >
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

  // Timer display classes
  let timerClass = "timer-rgb";
  if (timerValue <= 5) timerClass = "timer-urgent";

  // ---- LOBBY ----
  if (status === "lobby") {
    return (
      <div className="min-h-screen bg-gray-950 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header with logout */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-lg font-semibold">🎮 Gamemaster</h2>
            <button
              onClick={teacherLogout}
              className="text-gray-500 text-sm underline hover:text-gray-300"
            >
              Logi välja
            </button>
          </div>

          {/* Room code display */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 text-center mb-6 card-rgb">
            <h2 className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
              Toa kood
            </h2>
            <div className="text-6xl font-mono font-bold tracking-widest text-white timer-rgb mb-4">
              {roomCode}
            </div>
            <p className="text-gray-500 text-sm">Jaga seda koodi mängijatega</p>
            <p className="text-cyan-400 text-xs mt-2">
              {maxRounds} {maxRounds === 1 ? "round" : "roundi"} × 6 küsimust
            </p>
          </div>

          {/* Player list */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Mängijad ({players.length})
            </h3>
            {players.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Ootame mängijaid...
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {players.map(([uid, player]) => (
                  <div
                    key={uid}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-center"
                  >
                    <span className="text-2xl">👤</span>
                    <p className="font-medium text-gray-200 mt-1 text-sm">
                      {player.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controls - no more randomize button, auto-pairs on start */}
          <div className="space-y-3">
            <button
              onClick={startGame}
              disabled={players.length < 2}
              className={`w-full text-lg font-semibold py-4 px-6 rounded-xl transition ${
                players.length >= 2
                  ? "bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-600/30"
                  : "bg-gray-800 text-gray-600 cursor-not-allowed"
              }`}
            >
              {players.length < 2
                ? ("Vaja vähemalt 2 mängijat (praegu " + players.length + ")")
                : ("🚀 Alusta mängu (" + players.length + " mängijat)")}
            </button>
          </div>

          {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
        </div>
      </div>
    );
  }

  // ---- PLAYING ----
  if (status === "playing") {
    return (
      <div className="min-h-screen bg-gray-950 p-4">
        <div className="max-w-3xl mx-auto">
          {/* Round indicator */}
          <div className="text-center mb-2">
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">
              Round {currentRound} / {maxRounds}
            </span>
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <div className={`text-7xl font-bold font-mono ${timerClass}`}>
              {timerValue}
            </div>
            <p className="text-gray-500 text-sm mt-1">sekundit</p>
          </div>

          {/* Question display */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 text-center mb-6 fade-in">
            <div className="text-sm text-gray-500 mb-3 uppercase tracking-wider">
              Küsimus {currentQIdx} / {totalQ}
            </div>
            <p className="text-xl sm:text-2xl font-semibold text-white leading-relaxed">
              {currentQ}
            </p>
          </div>

          {/* Pairs overview */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Paarid</h3>
            <div className="grid gap-3">
              {pairs.map(([pairKey, pair]) => {
                const members = Object.entries(pair.members || {});
                const pairAnswer = answers?.[pairKey];
                return (
                  <div
                    key={pairKey}
                    className={`border rounded-xl p-4 transition ${
                      pairAnswer
                        ? "border-green-500/50 bg-green-900/20"
                        : "border-gray-700 bg-gray-800"
                    }`}
                  >
                    <div className="flex flex-wrap gap-2 mb-2">
                      {members.map(([uid, m]) => (
                        <span
                          key={uid}
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            m.role === "kysija"
                              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                              : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          }`}
                        >
                          {m.role === "kysija" ? "❓" : "💬"} {m.name}
                        </span>
                      ))}
                    </div>
                    {pairAnswer && (
                      <p className="text-sm text-green-300 mt-2 italic">
                        ✅ &quot;{pairAnswer.answer}&quot;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={nextQuestion}
              className="flex-1 bg-cyan-600 text-white text-lg font-semibold py-3 px-6 rounded-xl hover:bg-cyan-500 transition shadow-lg shadow-cyan-600/30"
            >
              Järgmine küsimus →
            </button>
            <button
              onClick={endGame}
              className="bg-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-red-500 transition shadow-lg shadow-red-600/30"
            >
              Lõpeta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- ROUND END (waiting for players to find new partners) ----
  if (status === "round_end") {
    return (
      <div className="min-h-screen bg-gray-950 p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-4">🔄</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Round {currentRound - 1} lõppes!
          </h2>
          <p className="text-gray-400 mb-6">
            Mängijad otsivad uut partnerit... ({readyCount}/{totalPlayers} valmis)
          </p>

          {/* New pairs preview */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Uued paarid (Round {currentRound})</h3>
            <div className="grid gap-3">
              {pairs.map(([pairKey, pair]) => {
                const members = Object.entries(pair.members || {});
                return (
                  <div
                    key={pairKey}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-3"
                  >
                    <div className="flex flex-wrap gap-2 justify-center">
                      {members.map(([uid, m]) => {
                        const isReady = readyPlayers[uid];
                        return (
                          <span
                            key={uid}
                            className={`text-sm px-3 py-1 rounded-full ${
                              isReady
                                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                                : "bg-gray-700 text-gray-300 border border-gray-600"
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

          {/* GM can force start */}
          <button
            onClick={startNextRound}
            className="w-full bg-green-600 text-white text-lg font-semibold py-4 rounded-xl hover:bg-green-500 transition shadow-lg shadow-green-600/30 mb-3"
          >
            🚀 Alusta Round {currentRound}
          </button>
          <p className="text-gray-600 text-xs">
            Vajuta kui kõik on uue partneri leidnud
          </p>
        </div>
      </div>
    );
  }

  // ---- FINISHED ----
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center card-rgb">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-2">Mäng läbi!</h2>
        <p className="text-gray-400 mb-6">
          {maxRounds} {maxRounds === 1 ? "round" : "roundi"} mängitud. Aitäh!
        </p>
        <button
          onClick={deleteRoom}
          className="w-full bg-cyan-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-cyan-500 transition shadow-lg shadow-cyan-600/30 mb-3"
        >
          Loo uus mäng
        </button>
        <button
          onClick={teacherLogout}
          className="text-gray-500 text-sm underline hover:text-gray-300"
        >
          Logi välja
        </button>
      </div>
    </div>
  );
}
