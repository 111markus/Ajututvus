import { useState } from "react";

export default function StudentView({
  roomCode,
  roomData,
  timerValue,
  joinRoom,
  leaveRoom,
  submitAnswer,
  markReady,
  error,
  myUid,
  goBack,
}) {
  const [nameInput, setNameInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ready, setReady] = useState(false);

  // ---- Join screen ----
  if (!roomCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-50 p-4">
        <div className="glass rounded-3xl shadow-sm p-8 w-full max-w-md fade-in">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🃏</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Liitu mänguga</h1>
            <p className="text-slate-500 text-sm">Sisesta oma nimi ja toa kood</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Sinu nimi</label>
              <input
                type="text"
                placeholder="nt. Mari"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Toa kood</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="nt. 1234"
                maxLength={4}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest text-slate-800 placeholder-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition outline-none"
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
            className={`w-full text-lg font-semibold py-3.5 rounded-xl transition-all duration-200 mb-3 ${
              nameInput.trim() && codeInput.length === 4
                ? "bg-violet-500 text-white hover:bg-violet-600 hover:scale-105 active:scale-95 shadow-md shadow-violet-200"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Liitu
          </button>
          <button
            onClick={goBack}
            className="w-full text-slate-400 text-sm font-medium hover:text-slate-600 transition py-2"
          >
            ← Tagasi
          </button>
          {error && <p className="mt-4 text-red-500 text-center text-sm font-medium">{error}</p>}
        </div>
      </div>
    );
  }

  const status = roomData?.status || "lobby";
  const players = roomData?.players ? Object.entries(roomData.players) : [];
  const currentQ = roomData?.questions?.[roomData?.currentQuestionIndex || 0];
  const totalQ = roomData?.totalQuestions || 6;
  const currentQIdx = (roomData?.currentQuestionIndex || 0) + 1;
  const pairs = roomData?.pairs ? Object.entries(roomData.pairs) : [];
  const currentRound = roomData?.currentRound || 1;
  const maxRounds = roomData?.totalRounds || 1;

  // Find my pair and role
  let myPair = null;
  let myRole = null;
  let partnerName = null;
  for (const [, pair] of pairs) {
    const members = pair.members || {};
    if (members[myUid]) {
      myPair = pair;
      myRole = members[myUid].role;
      for (const [uid, m] of Object.entries(members)) {
        if (uid !== myUid) partnerName = m.name;
      }
      break;
    }
  }

  // Timer aura class
  const timerAura = timerValue <= 10 ? "timer-aura timer-aura-warm" : "timer-aura";
  const timerColor = timerValue <= 5 ? "text-orange-500" : timerValue <= 10 ? "text-amber-500" : "text-violet-600";

  // Progress bar
  const progress = (currentQIdx / totalQ) * 100;
  const progressColor =
    progress < 50 ? "bg-violet-400" : progress < 80 ? "bg-indigo-400" : "bg-emerald-400";

  // Reset submitted state when question index changes
  const questionIndex = roomData?.currentQuestionIndex || 0;

  // ---- LOBBY ----
  if (status === "lobby") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-50 p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="glass rounded-3xl shadow-sm p-8 mb-6 fade-in">
            <div className="text-4xl mb-3">⏳</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Ootame alustamist...</h2>
            <p className="text-slate-500 text-sm mb-4">
              Tuba <span className="font-mono font-bold text-violet-500">{roomCode}</span>
            </p>
            <p className="text-indigo-400 text-xs font-medium">
              {maxRounds} {maxRounds === 1 ? "round" : "roundi"} × 6 küsimust
            </p>
          </div>

          <div className="glass rounded-3xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-3">
              Mängijad ({players.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {players.map(([uid, player]) => (
                <div
                  key={uid}
                  className={`bg-white rounded-2xl p-3 text-center shadow-sm border ${
                    uid === myUid ? "border-violet-300 ring-2 ring-violet-100" : "border-slate-100"
                  }`}
                >
                  <span className="text-2xl">{uid === myUid ? "🙋" : "👤"}</span>
                  <p className="font-medium text-slate-700 mt-1 text-sm">{player.name}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={leaveRoom}
            className="text-slate-400 text-sm font-medium hover:text-slate-600 transition"
          >
            ← Lahku toast
          </button>
        </div>
      </div>
    );
  }

  // ---- PLAYING ----
  if (status === "playing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-50 p-4">
        <div className="max-w-lg mx-auto">
          {/* Round */}
          <div className="text-center mb-2">
            <span className="text-violet-400 text-sm font-semibold uppercase tracking-wider">
              Round {currentRound} / {maxRounds}
            </span>
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <div className={timerAura}>
              <div className={`text-6xl font-extrabold font-mono ${timerColor} transition-colors duration-700`}>
                {timerValue}
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-2">sekundit</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 mb-6 overflow-hidden">
            <div
              className={`h-full rounded-full ${progressColor} transition-all duration-700`}
              style={{ width: progress + "%" }}
            />
          </div>

          {/* Partner & Role */}
          <div className="glass rounded-3xl shadow-sm p-6 mb-4 text-center">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Sinu partner</p>
            <p className="text-xl font-bold text-slate-800 mb-3">{partnerName || "..."}</p>
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                myRole === "kysija"
                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                  : "bg-violet-100 text-violet-700 border border-violet-200"
              }`}
            >
              {myRole === "kysija" ? "❓ Sina küsid" : "💬 Sina vastad"}
            </span>
          </div>

          {/* Question */}
          <div className="glass rounded-3xl shadow-sm p-6 mb-4 text-center fade-in" key={questionIndex}>
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest font-semibold">
              Küsimus {currentQIdx} / {totalQ}
            </p>
            <p className="text-lg font-semibold text-slate-800 leading-relaxed">{currentQ}</p>
          </div>

          {/* Answer input (for kysija) */}
          {myRole === "kysija" && (
            <div className="glass rounded-3xl shadow-sm p-6">
              {submitted ? (
                <div className="text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="text-emerald-600 font-medium">Vastus salvestatud!</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Kirjuta partneri vastus üles
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Partneri vastus..."
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition outline-none resize-none mb-3"
                  />
                  <button
                    onClick={() => {
                      if (answerInput.trim()) {
                        submitAnswer(answerInput.trim());
                        setAnswerInput("");
                        setSubmitted(true);
                        setTimeout(() => setSubmitted(false), 3000);
                      }
                    }}
                    disabled={!answerInput.trim()}
                    className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 ${
                      answerInput.trim()
                        ? "bg-violet-500 text-white hover:bg-violet-600 hover:scale-105 active:scale-95 shadow-md shadow-violet-200"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Salvesta vastus
                  </button>
                </div>
              )}
            </div>
          )}

          {myRole === "vastaja" && (
            <div className="glass rounded-3xl shadow-sm p-6 text-center">
              <p className="text-slate-500 text-sm">
                Vasta partnerile suuliselt 💬
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- ROUND END ----
  if (status === "round_end") {
    // Find new partner
    let newPartnerName = null;
    for (const [, pair] of pairs) {
      const members = pair.members || {};
      if (members[myUid]) {
        for (const [uid, m] of Object.entries(members)) {
          if (uid !== myUid) newPartnerName = m.name;
        }
        break;
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-50 p-4">
        <div className="glass rounded-3xl shadow-sm p-8 w-full max-w-md text-center fade-in">
          <div className="text-5xl mb-4 float">🔄</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Round {currentRound - 1} lõppes!
          </h2>
          <p className="text-slate-500 text-sm mb-6">Otsi üles oma uus partner</p>

          {newPartnerName && (
            <div className="partner-glow rounded-2xl p-6 mb-6">
              <p className="text-xs text-violet-400 uppercase tracking-widest mb-2 font-semibold">
                Sinu uus partner on
              </p>
              <p className="text-3xl font-extrabold text-violet-600">{newPartnerName}</p>
            </div>
          )}

          {ready ? (
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <p className="text-emerald-600 font-semibold">✅ Oled valmis! Oota teisi...</p>
            </div>
          ) : (
            <button
              onClick={() => {
                markReady();
                setReady(true);
              }}
              className="w-full bg-emerald-500 text-white text-lg font-semibold py-4 rounded-2xl hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-emerald-200"
            >
              Alusta uut roundi ✅
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---- FINISHED ----
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-50 p-4">
      <div className="glass rounded-3xl shadow-sm p-8 w-full max-w-md text-center fade-in">
        <div className="text-6xl mb-4 float">🎉</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Mäng läbi!</h2>
        <p className="text-slate-500 mb-6">
          {maxRounds} {maxRounds === 1 ? "round" : "roundi"} mängitud. Aitäh osalemise eest!
        </p>
        <button
          onClick={leaveRoom}
          className="w-full bg-violet-500 text-white font-semibold py-3 px-6 rounded-2xl hover:bg-violet-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-violet-200"
        >
          Tagasi algusesse
        </button>
      </div>
    </div>
  );
}
