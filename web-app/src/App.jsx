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
    joinRoom,
    submitAnswer,
    markReady,
    leaveRoom,
    getMyPairInfo,
  } = useAjututvus();

  // Loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 text-lg font-medium">Laadimine...</div>
      </div>
    );
  }

  // ---- ROLE SELECT ----
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 p-4">
        <div className="glass rounded-3xl shadow-sm p-10 w-full max-w-sm text-center fade-in">
          <div className="text-5xl mb-3 float">🎮</div>
          <h1 className="text-3xl font-extrabold text-gradient mb-1">Ajututvus</h1>
          <p className="text-slate-500 mb-10 text-sm">Icebreaker mäng</p>

          <div className="space-y-4">
            <button
              onClick={() => setRole("teacher_login")}
              className="w-full bg-indigo-500 text-white text-lg font-semibold py-4 rounded-2xl hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-indigo-200"
            >
              🎮 Gamemaster
            </button>

            <button
              onClick={() => setRole("student")}
              className="w-full bg-violet-500 text-white text-lg font-semibold py-4 rounded-2xl hover:bg-violet-600 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-violet-200"
            >
              🎲 Mängija
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- GM LOGIN ----
  if (role === "teacher_login") {
    return (
      <TeacherLogin
        onLogin={(u, p) => teacherLogin(u, p)}
        onBack={() => setRole(null)}
        error={error}
      />
    );
  }

  // ---- GM VIEW ----
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
        error={error}
      />
    );
  }

  // ---- MÄNGIJA VIEW ----
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
