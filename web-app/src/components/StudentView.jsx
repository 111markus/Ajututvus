import { useState, useEffect, useRef } from "react";

export default function StudentView({
  user,
  roomCode,
  roomData,
  timerValue,
  joinRoom,
  leaveRoom,
  submitAnswer,
  markReady,
  goBack,
  getMyPairInfo,
  error,
  setError,
}) {
  const [nameInput, setNameInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const prevQIdx = useRef(null);

  // Reset submitted when question changes
  const questionIndex = roomData?.currentQuestionIndex || 0;
  useEffect(() => {
    if (prevQIdx.current !== null && prevQIdx.current !== questionIndex) {
      setSubmitted(false);
      setAnswerInput("");
    }
    prevQIdx.current = questionIndex;
  }, [questionIndex]);

  // Detect if kicked (player removed from room while in lobby/playing)
  useEffect(() => {
    if (
      roomCode &&
      roomData &&
      roomData.players &&
      user &&
      !roomData.players[user.uid]
    ) {
      // Player was removed (kicked)
      setError("Sind eemaldati toast!");
      goBack();
    }
  }, [roomData?.players, user, roomCode]);

  // ---- Join screen ----
  if (!roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-game p-4">
        <div className="neon-glass rounded-3xl glow-cyan p-8 w-full max-w-md fade-in">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🎲</div>
            <h1 className="text-2xl font-black text-white mb-1">
              LIITU MÄNGUGA
            </h1>
            <p className="text-white/30 text-sm uppercase tracking-widest">
              Sisesta nimi ja toa kood
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">
                Sinu nimi
              </label>
              <input
                type="text"
                placeholder="nt. Mari"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 placeholder-white/20 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">
                Toa kood
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="1234"
                maxLength={4}
                value={codeInput}
                onChange={(e) =>
                  setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-center text-3xl font-black tracking-widest focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 placeholder-white/20 transition font-mono"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (nameInput.trim() && codeInput.length === 4) {
                joinRoom(codeInput, nameInput.trim());
              }
            }}
            disabled={!nameInput.trim() || codeInput.length !== 4}
            className={`btn-neon w-full text-lg font-bold py-4 rounded-xl mb-3 ${
              nameInput.trim() && codeInput.length === 4
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white glow-cyan"
                : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
            }`}
          >
            ⚡ LIITU
          </button>
          <button
            onClick={goBack}
            className="w-full text-white/20 text-sm hover:text-white/40 transition py-2"
          >
            ← Tagasi
          </button>
          {error && (
            <p className="mt-4 text-red-400 text-center text-sm">{error}</p>
          )}
        </div>
      </div>
    );
  }

  const status = roomData?.status || "lobby";
  const players = roomData?.players ? Object.entries(roomData.players) : [];
  const currentQ = roomData?.questions?.[questionIndex];
  const totalQ = roomData?.totalQuestions || 6;
  const currentQIdx = questionIndex + 1;
  const currentRound = roomData?.currentRound || 1;
  const maxRounds = roomData?.totalRounds || 1;
  const pairInfo = getMyPairInfo();

  const timerClass =
    timerValue <= 10 ? "timer-ring timer-danger" : "timer-ring";
  const timerColor =
    timerValue <= 5
      ? "text-red-400"
      : timerValue <= 10
        ? "text-amber-400"
        : "text-white";

  // Progress
  const progress = (currentQIdx / totalQ) * 100;

  // ---- LOBBY ----
  if (status === "lobby") {
    return (
      <div className="min-h-screen bg-game p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="neon-glass rounded-3xl glow-cyan p-8 mb-6 fade-in">
            <div className="text-5xl mb-3 mega-pulse">⏳</div>
            <h2 className="text-xl font-black text-white mb-2">OOTAME ALUSTAMIST</h2>
            <p className="text-white/40 text-sm mb-3">
              Tuba <span className="font-mono font-black text-neon-cyan">{roomCode}</span>
            </p>
            <p className="text-white/20 text-xs">
              {maxRounds} {maxRounds === 1 ? "voor" : "vooru"} × 6 küsimust
            </p>
          </div>

          <div className="neon-glass rounded-3xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-3">
              MÄNGIJAD ({players.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {players.map(([uid, player]) => (
                <div
                  key={uid}
                  className={`neon-glass-light rounded-2xl p-3 text-center ${
                    uid === user?.uid
                      ? "glow-cyan border border-cyan-500/30"
                      : ""
                  }`}
                >
                  <span className="text-2xl">
                    {uid === user?.uid ? "🙋" : "👤"}
                  </span>
                  <p className="font-medium text-white/80 mt-1 text-sm">
                    {player.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={leaveRoom}
            className="text-white/20 text-sm hover:text-white/40 transition"
          >
            ← Lahku toast
          </button>
        </div>
      </div>
    );
  }

  // ---- PLAYING ----
  if (status === "playing" && pairInfo) {
    const { myRole, partnerNames, pairKey } = pairInfo;
    const partnerName = partnerNames[0] || "...";

    // ===== KYSIJA (ASKER) VIEW =====
    if (myRole === "kysija") {
      return (
        <div className="min-h-screen bg-asker p-4">
          <div className="max-w-lg mx-auto">
            {/* Round label */}
            <div className="text-center mb-2">
              <span className="text-pink-300/50 text-xs font-bold uppercase tracking-widest">
                Voor {currentRound}/{maxRounds} · Küsimus {currentQIdx}/{totalQ}
              </span>
            </div>

            {/* MASSIVE TIMER */}
            <div className="text-center mb-6">
              <div className={timerClass}>
                <div
                  className={`text-7xl sm:text-8xl font-black font-mono ${timerColor} transition-colors duration-500`}
                >
                  {timerValue}
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="w-full bg-white/5 rounded-full h-1.5 mb-6 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-700"
                style={{ width: progress + "%" }}
              />
            </div>

            {/* Role + Partner */}
            <div className="neon-glass rounded-2xl glow-pink p-4 mb-4 text-center role-pulse">
              <span className="text-pink-300 text-sm font-bold uppercase tracking-widest">
                ❓ Sina küsid
              </span>
              <p className="text-white/40 text-xs mt-1">
                Partner:{" "}
                <span className="text-white font-bold">{partnerName}</span>
              </p>
            </div>

            {/* THE QUESTION - BIG AND VISIBLE */}
            <div
              className="neon-glass rounded-3xl glow-pink p-6 sm:p-8 text-center mb-4 fade-in"
              key={questionIndex}
            >
              <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                {currentQ}
              </p>
            </div>

            {/* Answer chatbox */}
            <div className="neon-glass rounded-2xl p-4">
              {submitted ? (
                <div className="text-center py-2">
                  <div className="text-3xl mb-1">✅</div>
                  <p className="text-green-400 font-bold text-sm">
                    SALVESTATUD!
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">
                    Kirjuta partneri vastus
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Partneri vastus..."
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 placeholder-white/15 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/50 transition resize-none mb-3"
                  />
                  <button
                    onClick={() => {
                      if (answerInput.trim()) {
                        submitAnswer(pairKey, answerInput.trim());
                        setAnswerInput("");
                        setSubmitted(true);
                      }
                    }}
                    disabled={!answerInput.trim()}
                    className={`btn-neon w-full font-bold py-3 rounded-xl ${
                      answerInput.trim()
                        ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white glow-pink"
                        : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                    }`}
                  >
                    📤 SAADA
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // ===== VASTAJA (ANSWERER) VIEW =====
    return (
      <div className="min-h-screen bg-answerer flex flex-col items-center justify-center p-4">
        <div className="max-w-lg mx-auto text-center w-full">
          {/* Round info */}
          <div className="mb-4">
            <span className="text-cyan-300/40 text-xs font-bold uppercase tracking-widest">
              Voor {currentRound}/{maxRounds} · Küsimus {currentQIdx}/{totalQ}
            </span>
          </div>

          {/* Timer */}
          <div className="mb-8">
            <div className={timerClass}>
              <div
                className={`text-7xl sm:text-8xl font-black font-mono ${timerColor} transition-colors duration-500`}
              >
                {timerValue}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full bg-white/5 rounded-full h-1.5 mb-8 overflow-hidden max-w-xs mx-auto">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
              style={{ width: progress + "%" }}
            />
          </div>

          {/* MASSIVE "YOU ANSWER" text */}
          <div className="neon-glass rounded-3xl glow-cyan p-8 sm:p-12 mb-6 role-pulse">
            <h1 className="text-4xl sm:text-5xl font-black text-neon-cyan answerer-pulse mb-4">
              SINA VASTAD!
            </h1>
            <p className="text-white/40 text-lg">
              Kuula küsimust ja vasta{" "}
              <span className="text-white font-bold">kõva häälega!</span>
            </p>
          </div>

          {/* Partner name */}
          <div className="neon-glass-light rounded-2xl p-4">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">
              Sinu partner
            </p>
            <p className="text-white font-bold text-lg">{partnerName}</p>
          </div>
        </div>
      </div>
    );
  }

  // ---- ROUND END ----
  if (status === "round_end" && pairInfo) {
    const { partnerNames, pairKey, readySlot, p1Ready, p2Ready, started } =
      pairInfo;
    const newPartnerName = partnerNames[0] || "...";
    const iAmReady = readySlot === "p1Ready" ? p1Ready : p2Ready;
    const bothReady = p1Ready && p2Ready;

    return (
      <div className="min-h-screen flex items-center justify-center bg-game p-4">
        <div className="neon-glass rounded-3xl glow-purple p-8 w-full max-w-md text-center fade-in">
          {started || bothReady ? (
            <>
              <div className="text-5xl mb-4 mega-pulse">🚀</div>
              <h2 className="text-2xl font-black text-white mb-2">
                VOOR ALGAB!
              </h2>
              <p className="text-white/40">
                Mõlemad on valmis — ootame käivitust...
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4 float">🔄</div>
              <h2 className="text-2xl font-black text-white mb-2">
                VOOR {currentRound - 1} LÕPPES!
              </h2>
              <p className="text-white/30 text-sm mb-6">Otsi üles oma uus partner</p>

              <div className="partner-reveal rounded-2xl p-6 mb-6">
                <p className="text-xs text-purple-300/60 uppercase tracking-widest mb-2 font-bold">
                  Sinu uus partner on
                </p>
                <p className="text-4xl font-black text-neon-purple">
                  {newPartnerName}
                </p>
              </div>

              {iAmReady ? (
                <div className="neon-glass-light rounded-2xl p-4 glow-green">
                  <p className="text-green-400 font-bold">✅ OLED VALMIS!</p>
                  <p className="text-white/30 text-xs mt-1">
                    Ootame partnerit...
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => markReady(pairKey, readySlot)}
                  className="btn-neon w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold py-4 rounded-2xl glow-green"
                >
                  LEIDSIN PAARILISE, ALUSTA! ✅
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ---- FINISHED ----
  if (status === "finished") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-game p-4">
        <div className="neon-glass rounded-3xl glow-purple p-8 w-full max-w-md text-center fade-in">
          <div className="text-7xl mb-4 float">🎉</div>
          <h2 className="text-3xl font-black text-white mb-2">MÄNG LÄBI!</h2>
          <p className="text-white/40 mb-6">
            {maxRounds} {maxRounds === 1 ? "voor" : "vooru"} mängitud. Aitäh!
          </p>
          <button
            onClick={leaveRoom}
            className="btn-neon w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 px-6 rounded-2xl glow-cyan"
          >
            TAGASI ALGUSESSE
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-game">
      <div className="text-white/30">Laadimine...</div>
    </div>
  );
}
