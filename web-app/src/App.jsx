import { useAjututvus } from "./hooks/useAjututvus";
import TeacherLogin from "./components/TeacherLogin";
import TeacherView from "./components/TeacherView";
import StudentView from "./components/StudentView";

function App() {
  const {
    user,
    role,
    setRole,
    roomCode,
    roomData,
    error,
    setError,
    timerValue,
    totalRounds,
    setTotalRounds,
    teacherLogin,
    teacherLogout,
    createRoom,
    startGame,
    startNextRound,
    nextQuestion,
    endGame,
    deleteRoom,
    kickPlayer,
    joinRoom,
    submitAnswer,
    markReady,
    leaveRoom,
    getMyPairInfo,
  } = useAjututvus();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-game">
        <div className="text-center fade-in">
          <div className="text-5xl mb-4 float">🎮</div>
          <div className="text-white/40 text-lg font-medium">Laadimine...</div>
        </div>
      </div>
    );
  }

  // ---- ROLE SELECT ----
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-game p-4">
        <div className="neon-glass rounded-3xl glow-purple p-10 w-full max-w-sm text-center fade-in">
          <div className="text-6xl mb-4 float">🎮</div>
          <h1 className="text-4xl font-black text-gradient-neon mb-2 tracking-tight">AJUTUTVUS</h1>
          <p className="text-white/40 mb-10 text-sm tracking-widest uppercase">Icebreaker Party Game</p>

          <div className="space-y-4">
            <button
              onClick={() => setRole("student")}
              className="btn-neon w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-lg font-bold py-4 rounded-2xl glow-cyan"
            >
              🎲 MÄNGIJA
            </button>
            <button
              onClick={() => setRole("teacher_login")}
              className="btn-neon w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold py-4 rounded-2xl glow-purple"
            >
              🎮 MÄNGU JUHT
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (role === "teacher_login") {
    return (
      <TeacherLogin
        onLogin={(u, p) => teacherLogin(u, p)}
        onBack={() => setRole(null)}
        error={error}
      />
    );
  }

  if (role === "teacher") {
    return (
      <TeacherView
        roomCode={roomCode}
        roomData={roomData}
        timerValue={timerValue}
        totalRounds={totalRounds}
        setTotalRounds={setTotalRounds}
        createRoom={createRoom}
        startGame={startGame}
        startNextRound={startNextRound}
        nextQuestion={nextQuestion}
        endGame={endGame}
        deleteRoom={() => deleteRoom()}
        teacherLogout={teacherLogout}
        kickPlayer={kickPlayer}
        error={error}
      />
    );
  }

  if (role === "student") {
    return (
      <StudentView
        user={user}
        roomCode={roomCode}
        roomData={roomData}
        timerValue={timerValue}
        joinRoom={joinRoom}
        submitAnswer={submitAnswer}
        markReady={markReady}
        leaveRoom={() => leaveRoom()}
        goBack={() => setRole(null)}
        getMyPairInfo={getMyPairInfo}
        error={error}
        setError={setError}
      />
    );
  }

  return null;
}

export default App;
