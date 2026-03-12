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
    // Gamemaster
    teacherLogin,
    teacherLogout,
    createRoom,
    startGame,
    startNextRound,
    nextQuestion,
    endGame,
    deleteRoom,
    // Mängija
    joinRoom,
    submitAnswer,
    markReady,
    leaveRoom,
    getMyPairInfo,
  } = useAjututvus();

  // Loading
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-gray-500 text-lg">Laadimine...</div>
      </div>
    );
  }

  // ---- ROLE SELECT ----
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center card-rgb">
          <h1 className="text-4xl font-bold text-white mb-2">🎮 Ajututvus</h1>
          <p className="text-gray-400 mb-8">Icebreaker mäng</p>

          <div className="space-y-4">
            <button
              onClick={() => setRole("teacher_login")}
              className="w-full bg-cyan-600 text-white text-lg font-semibold py-4 rounded-xl hover:bg-cyan-500 transition shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2"
            >
              🎮 Gamemaster
            </button>

            <button
              onClick={() => setRole("student")}
              className="w-full bg-purple-600 text-white text-lg font-semibold py-4 rounded-xl hover:bg-purple-500 transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
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
        onLogin={(u, p) => {
          teacherLogin(u, p);
        }}
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
        deleteRoom={() => {
          deleteRoom();
        }}
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
        leaveRoom={() => {
          leaveRoom();
        }}
        getMyPairInfo={getMyPairInfo}
        error={error}
        setError={setError}
      />
    );
  }

  return null;
}

export default App;
