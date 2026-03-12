export default function TeacherView({
  roomCode,
  roomData,
  timerValue,
  createRoom,
  randomizePairs,
  startGame,
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
            🎓 Õpetaja paneel
          </h1>
          <p className="text-gray-400 mb-6">Loo uus mängutuba õpilastele</p>
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
  const answers =
    roomData?.answers?.[`q${roomData?.currentQuestionIndex || 0}`];

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
            <h2 className="text-white text-lg font-semibold">🎓 Õpetaja</h2>
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
            <p className="text-gray-500 text-sm">Jaga seda koodi õpilastega</p>
          </div>

          {/* Player list */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Osalejad ({players.length})
            </h3>
            {players.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Ootame osalejaid...
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

          {/* Pairs preview (if randomized before starting) */}
          {pairs.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Paarid (eelvaade)
              </h3>
              <div className="grid gap-3">
                {pairs.map(([pairKey, pair]) => {
                  const members = Object.entries(pair.members || {});
                  return (
                    <div
                      key={pairKey}
                      className="bg-gray-800 border border-gray-700 rounded-xl p-3"
                    >
                      <div className="flex flex-wrap gap-2">
                        {members.map(([uid, m]) => (
                          <span key={uid} className="text-gray-200 text-sm">
                            👤 {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="space-y-3">
            <button
              onClick={randomizePairs}
              disabled={players.length < 2}
              className={`w-full text-lg font-semibold py-3 px-6 rounded-xl transition ${
                players.length >= 2
                  ? "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                  : "bg-gray-800 text-gray-600 cursor-not-allowed"
              }`}
            >
              🔀 Sega paarid (Randomize)
            </button>

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
                ? `Vaja vähemalt 2 mängijat (praegu ${players.length})`
                : `🚀 Alusta mängu (${players.length} mängijat)`}
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
                        ✅ "{pairAnswer.answer}"
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

  // ---- FINISHED ----
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center card-rgb">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-2">Mäng läbi!</h2>
        <p className="text-gray-400 mb-6">Aitäh osalemise eest!</p>
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
