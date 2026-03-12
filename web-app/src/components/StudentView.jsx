import { useState, useEffect } from "react";

export default function StudentView({
  user,
  roomCode,
  roomData,
  timerValue,
  joinRoom,
  submitAnswer,
  markReady,
  leaveRoom,
  getMyPairInfo,
  error,
  setError,
}) {
  const [codeInput, setCodeInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [markedReady, setMarkedReady] = useState(false);

  const status = roomData?.status;
  const pairInfo = getMyPairInfo ? getMyPairInfo() : null;
  const currentQ = roomData?.questions?.[roomData?.currentQuestionIndex || 0];
  const currentQIdx = roomData?.currentQuestionIndex || 0;
  const totalQ = roomData?.totalQuestions || 6;
  const currentRound = roomData?.currentRound || 1;
  const maxRounds = roomData?.totalRounds || 1;

  // Reset submitted state when question changes
  useEffect(() => {
    setSubmitted(false);
    setAnswerInput("");
  }, [currentQIdx]);

  // Reset markedReady when round changes
  useEffect(() => {
    setMarkedReady(false);
  }, [currentRound]);

  // Timer display classes
  let timerClass = "timer-rgb";
  if (timerValue <= 5) timerClass = "timer-urgent";

  // Progress bar width
  const progressPct = Math.max(0, (timerValue / 30) * 100);
  let progressColor = "bg-green-500 shadow-green-500/50";
  if (timerValue <= 10) progressColor = "bg-yellow-500 shadow-yellow-500/50";
  if (timerValue <= 5) progressColor = "bg-red-500 shadow-red-500/50";

  // ---- JOIN SCREEN ----
  if (!roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm card-rgb">
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            🎮 Ajututvus
          </h1>
          <p className="text-gray-400 text-center mb-6">Liitu mänguga</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Sinu nimi
              </label>
              <input
                type="text"
                placeholder="Sisesta oma nimi"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Toa kood
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Nt: 4821"
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value.replace(/[^0-9]/g, ""));
                  setError(null);
                }}
                maxLength={4}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-2xl text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600"
              />
            </div>

            <button
              onClick={() => {
                if (!nameInput.trim()) {
                  setError("Palun sisesta oma nimi!");
                  return;
                }
                if (codeInput.length !== 4) {
                  setError("Kood peab olema 4 numbrit!");
                  return;
                }
                joinRoom(codeInput, nameInput);
              }}
              className="w-full bg-purple-600 text-white text-lg font-semibold py-3 rounded-xl hover:bg-purple-500 transition shadow-lg shadow-purple-600/30"
            >
              Liitu
            </button>

            <button
              onClick={leaveRoom}
              className="w-full text-gray-500 text-sm underline hover:text-gray-300"
            >
              ← Tagasi
            </button>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- LOBBY (waiting for GM to start) ----
  if (status === "lobby") {
    const players = roomData?.players ? Object.values(roomData.players) : [];
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
          <div className="text-5xl mb-4 animate-bounce">⏳</div>
          <h2 className="text-2xl font-bold text-white mb-2">Ootame...</h2>
          <p className="text-gray-400 mb-6">Gamemaster alustab mängu peagi</p>

          <div className="bg-gray-800 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-500 mb-2">
              Toas on {players.length} mängijat:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {players.map((p, i) => (
                <span
                  key={i}
                  className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={leaveRoom}
            className="text-red-400 text-sm underline hover:text-red-300"
          >
            ← Tagasi (lahku toast)
          </button>
        </div>
      </div>
    );
  }

  // ---- PLAYING ----
  if (status === "playing" && pairInfo) {
    const { myRole, partnerNames, pairKey } = pairInfo;
    const isKysija = myRole === "kysija";

    return (
      <div className="min-h-screen bg-gray-950 p-4">
        <div className="max-w-sm mx-auto">
          {/* Round indicator */}
          <div className="text-center mb-1">
            <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              Round {currentRound} / {maxRounds}
            </span>
          </div>

          {/* Timer */}
          <div className="text-center mb-3">
            <div className={`text-7xl font-bold font-mono ${timerClass}`}>
              {timerValue}
            </div>
            <p className="text-gray-500 text-xs mt-1">sekundit</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 mb-6 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 shadow-lg ${progressColor}`}
              style={{ width: progressPct + "%" }}
            />
          </div>

          {/* Role badge */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-5 mb-4 text-center fade-in">
            <div
              className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-3 ${
                isKysija
                  ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                  : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
              }`}
            >
              {isKysija ? "❓ Sina oled KÜSIJA" : "💬 Sina oled VASTAJA"}
            </div>

            <p className="text-sm text-gray-400">
              Partner:{" "}
              <strong className="text-gray-200">
                {partnerNames.join(", ")}
              </strong>
            </p>
          </div>

          {/* Question card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-6 mb-4 card-rgb fade-in">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
              Küsimus {currentQIdx + 1} / {totalQ}
            </p>
            <p className="text-lg font-semibold text-white leading-relaxed">
              {currentQ}
            </p>
          </div>

          {/* Action area - only Küsija submits */}
          {isKysija && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-6 fade-in">
              {!submitted ? (
                <>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Kirjuta vastaja vastus lühidalt:
                  </label>
                  <textarea
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Kirjuta vastus siia..."
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-3 placeholder-gray-500"
                  />
                  <button
                    onClick={async () => {
                      if (!answerInput.trim()) return;
                      await submitAnswer(pairKey, answerInput.trim());
                      setSubmitted(true);
                    }}
                    className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-500 transition shadow-lg shadow-green-600/30"
                  >
                    Saada ✓
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-green-300 font-medium">Vastus saadetud!</p>
                  <p className="text-gray-500 text-sm">
                    Ootame järgmist küsimust...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Vastaja sees instruction */}
          {!isKysija && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-6 text-center fade-in">
              <div className="text-4xl mb-3">🗣️</div>
              <p className="text-gray-200 font-medium">
                Vasta suuliselt küsijale!
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Küsija kirjutab sinu vastuse üles.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- ROUND END (find new partner) ----
  if (status === "round_end" && pairInfo) {
    const { partnerNames } = pairInfo;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center card-rgb">
          <div className="text-5xl mb-4">🔄</div>
          <h2 className="text-xl font-bold text-white mb-2">
            Round {currentRound - 1} läbi!
          </h2>
          <p className="text-gray-400 mb-4">Sinu uus partner on:</p>
          <div className="bg-gray-800 border border-cyan-500/30 rounded-xl p-4 mb-6">
            <p className="text-2xl font-bold text-cyan-300 timer-rgb">
              {partnerNames.join(", ")}
            </p>
          </div>
          <p className="text-gray-500 text-sm mb-6">
            Otsi oma uus partner klassist üles!
          </p>

          {!markedReady ? (
            <button
              onClick={() => {
                markReady();
                setMarkedReady(true);
              }}
              className="w-full bg-green-600 text-white text-lg font-semibold py-4 rounded-xl hover:bg-green-500 transition shadow-lg shadow-green-600/30"
            >
              ✅ Alusta uut roundi
            </button>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce">⏳</div>
              <p className="text-green-300 font-medium">Oled valmis!</p>
              <p className="text-gray-500 text-sm mt-1">
                Ootame teisi mängijaid...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- FINISHED ----
  if (status === "finished") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center card-rgb">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Mäng läbi!</h2>
          <p className="text-gray-400 mb-6">Aitäh osalemise eest!</p>
          <button
            onClick={leaveRoom}
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-500 transition shadow-lg shadow-purple-600/30"
          >
            Tagasi algusesse
          </button>
        </div>
      </div>
    );
  }

  // Fallback / loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-gray-400 text-xl">Laadimine...</div>
    </div>
  );
}
