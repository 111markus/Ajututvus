import { useState, useEffect, useCallback, useRef } from "react";
import {
  ref,
  set,
  onValue,
  update,
  remove,
  get,
} from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth, signInPlayer } from "../firebase";
import { QUESTIONS, shuffleArray } from "../data/questions";

// Generate a random 4-digit room code like "4821"
function generateRoomCode() {
  const chars = "0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Create pairs from players. If odd number, last group has 3.
function createPairs(playerIds) {
  const shuffled = shuffleArray(playerIds);
  const pairs = [];
  let i = 0;
  while (i < shuffled.length) {
    if (shuffled.length - i === 3) {
      pairs.push(shuffled.slice(i, i + 3));
      i += 3;
    } else {
      pairs.push(shuffled.slice(i, i + 2));
      i += 2;
    }
  }
  return pairs;
}

// Build the initial role assignments for a pair/group
// 2-member pair: [kysija, vastaja] — each asks 3 times = 6 questions
// 3-member group: [kysija, vastaja, vastaja] — each asks 2 times = 6 questions
function buildPairRoles(memberIds) {
  const roles = {};
  memberIds.forEach((id, idx) => {
    roles[id] = idx === 0 ? "kysija" : "vastaja";
  });
  return roles;
}

// Rotate who is the kysija in a group
function rotateRoles(members) {
  const ids = Object.keys(members);
  const currentKysijaIdx = ids.findIndex((id) => members[id].role === "kysija");
  const nextKysijaIdx = (currentKysijaIdx + 1) % ids.length;

  const updated = {};
  ids.forEach((id, idx) => {
    updated[id] = {
      ...members[id],
      role: idx === nextKysijaIdx ? "kysija" : "vastaja",
    };
  });
  return updated;
}

export function useAjututvus() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(() => {
    // Restore teacher session from localStorage
    const saved = localStorage.getItem("ajututvus_role");
    return saved || null;
  });
  const [roomCode, setRoomCode] = useState(() => {
    return localStorage.getItem("ajututvus_roomCode") || null;
  });
  const [roomData, setRoomData] = useState(null);
  const [error, setError] = useState(null);
  const [timerValue, setTimerValue] = useState(30);
  const timerRef = useRef(null);
  const autoAdvanceRef = useRef(false);

  // Persist role & roomCode to localStorage
  useEffect(() => {
    if (role) localStorage.setItem("ajututvus_role", role);
    else localStorage.removeItem("ajututvus_role");
  }, [role]);

  useEffect(() => {
    if (roomCode) localStorage.setItem("ajututvus_roomCode", roomCode);
    else localStorage.removeItem("ajututvus_roomCode");
  }, [roomCode]);

  // Auth
  useEffect(() => {
    signInPlayer().catch((err) => setError(err.message));
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  // Listen to room data
  useEffect(() => {
    if (!roomCode) return;
    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsub = onValue(roomRef, (snap) => {
      const data = snap.val();
      if (!data) {
        // Room was deleted
        setRoomData(null);
        setRoomCode(null);
        return;
      }
      setRoomData(data);
    });
    return () => unsub();
  }, [roomCode]);

  // Timer logic + auto-advance when timer hits 0
  useEffect(() => {
    if (!roomData || roomData.status !== "playing") {
      clearInterval(timerRef.current);
      setTimerValue(30);
      return;
    }

    if (roomData.timerStart) {
      autoAdvanceRef.current = false;

      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - roomData.timerStart) / 1000);
        const remaining = Math.max(0, 30 - elapsed);
        setTimerValue(remaining);

        // Auto-advance: only the teacher triggers it to avoid race conditions
        if (remaining === 0 && role === "teacher" && !autoAdvanceRef.current) {
          autoAdvanceRef.current = true;
          advanceQuestion();
        }
      };
      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [roomData?.timerStart, roomData?.status, roomData?.currentQuestionIndex, role]);

  // ========== TEACHER ACTIONS ==========

  const teacherLogin = useCallback((username, password) => {
    if (username === "Opetaja" && password === "Voco123") {
      setRole("teacher");
      setError(null);
      return true;
    }
    setError("Vale kasutajanimi või parool!");
    return false;
  }, []);

  const teacherLogout = useCallback(() => {
    setRole(null);
    setRoomCode(null);
    setRoomData(null);
    localStorage.removeItem("ajututvus_role");
    localStorage.removeItem("ajututvus_roomCode");
  }, []);

  const createRoom = useCallback(async () => {
    if (!user) {
      setError("Kasutaja pole sisse logitud!");
      return;
    }
    try {
      const code = generateRoomCode();
      const roomRef = ref(db, `rooms/${code}`);

      const existing = await get(roomRef);
      if (existing.exists()) {
        return createRoom();
      }

      // Always pick 6 random questions per game
      const gameQuestions = shuffleArray(QUESTIONS).slice(0, 6);

      await set(roomRef, {
        status: "lobby",
        teacherId: user.uid,
        players: {},
        pairs: null,
        currentQuestionIndex: 0,
        totalQuestions: 6,
        questions: gameQuestions,
        timerStart: null,
        createdAt: Date.now(),
      });

      setRoomCode(code);
      setError(null);
      return code;
    } catch (err) {
      console.error("createRoom error:", err);
      setError("Toa loomine ebaõnnestus: " + err.message);
    }
  }, [user]);

  const randomizePairs = useCallback(async () => {
    if (!roomCode || !roomData) return;
    const playerIds = Object.keys(roomData.players || {});
    if (playerIds.length < 2) {
      setError("Vaja on vähemalt 2 mängijat!");
      return;
    }

    const pairs = createPairs(playerIds);
    const pairsObj = {};
    pairs.forEach((group, idx) => {
      const members = {};
      group.forEach((pid, pidx) => {
        members[pid] = {
          name: roomData.players[pid].name,
          role: pidx === 0 ? "kysija" : "vastaja",
        };
      });
      pairsObj[`pair_${idx}`] = { members };
    });

    await update(ref(db, `rooms/${roomCode}`), {
      pairs: pairsObj,
    });
  }, [roomCode, roomData]);

  const startGame = useCallback(async () => {
    if (!roomCode || !roomData) return;
    const playerIds = Object.keys(roomData.players || {});
    if (playerIds.length < 2) {
      setError("Vaja on vähemalt 2 mängijat!");
      return;
    }

    // If pairs haven't been randomized yet, do it now
    let pairsObj = roomData.pairs;
    if (!pairsObj) {
      const pairs = createPairs(playerIds);
      pairsObj = {};
      pairs.forEach((group, idx) => {
        const members = {};
        group.forEach((pid, pidx) => {
          members[pid] = {
            name: roomData.players[pid].name,
            role: pidx === 0 ? "kysija" : "vastaja",
          };
        });
        pairsObj[`pair_${idx}`] = { members };
      });
    }

    await update(ref(db, `rooms/${roomCode}`), {
      status: "playing",
      pairs: pairsObj,
      currentQuestionIndex: 0,
      timerStart: Date.now(),
      answers: null,
    });
  }, [roomCode, roomData]);

  // Core question advance logic (used by auto-advance and manual button)
  const advanceQuestion = useCallback(async () => {
    if (!roomCode || !roomData) return;
    const nextIdx = (roomData.currentQuestionIndex || 0) + 1;
    const total = roomData.totalQuestions || 6;

    if (nextIdx >= total) {
      await update(ref(db, `rooms/${roomCode}`), {
        status: "finished",
        timerStart: null,
      });
      return;
    }

    // Rotate roles in each pair
    const updatedPairs = {};
    for (const [pairKey, pair] of Object.entries(roomData.pairs || {})) {
      updatedPairs[pairKey] = {
        members: rotateRoles(pair.members),
      };
    }

    await update(ref(db, `rooms/${roomCode}`), {
      currentQuestionIndex: nextIdx,
      timerStart: Date.now(),
      pairs: updatedPairs,
      answers: null,
    });
  }, [roomCode, roomData]);

  const nextQuestion = useCallback(async () => {
    await advanceQuestion();
  }, [advanceQuestion]);

  const endGame = useCallback(async () => {
    if (!roomCode) return;
    await update(ref(db, `rooms/${roomCode}`), {
      status: "finished",
      timerStart: null,
    });
  }, [roomCode]);

  const deleteRoom = useCallback(async () => {
    if (!roomCode) return;
    await remove(ref(db, `rooms/${roomCode}`));
    setRoomCode(null);
    setRoomData(null);
  }, [roomCode]);

  // ========== STUDENT ACTIONS ==========

  const joinRoom = useCallback(
    async (code, name) => {
      if (!user) return;
      const upperCode = code.toUpperCase().trim();
      try {
        const roomRef = ref(db, `rooms/${upperCode}`);
        const snap = await get(roomRef);

        if (!snap.exists()) {
          setError("Sellist tuba ei leitud!");
          return false;
        }

        const data = snap.val();
        if (data.status !== "lobby") {
          setError("Mäng on juba alanud!");
          return false;
        }

        await update(ref(db, `rooms/${upperCode}/players/${user.uid}`), {
          name: name.trim(),
          joinedAt: Date.now(),
        });

        setRole("student");
        setRoomCode(upperCode);
        setError(null);
        return true;
      } catch (err) {
        setError("Liitumine ebaõnnestus: " + err.message);
        return false;
      }
    },
    [user]
  );

  const submitAnswer = useCallback(
    async (pairKey, answer) => {
      if (!roomCode || !user) return;
      const qIdx = roomData?.currentQuestionIndex || 0;

      await update(
        ref(db, `rooms/${roomCode}/answers/q${qIdx}/${pairKey}`),
        {
          answer,
          submittedBy: user.uid,
          timestamp: Date.now(),
        }
      );
    },
    [roomCode, roomData, user]
  );

  const leaveRoom = useCallback(async () => {
    if (!roomCode || !user) return;
    if (role === "student") {
      await remove(ref(db, `rooms/${roomCode}/players/${user.uid}`));
    }
    setRoomCode(null);
    setRoomData(null);
    setRole(null);
  }, [roomCode, user, role]);

  // Find current player's pair info
  const getMyPairInfo = useCallback(() => {
    if (!roomData?.pairs || !user) return null;
    for (const [pairKey, pair] of Object.entries(roomData.pairs)) {
      if (pair.members && pair.members[user.uid]) {
        return {
          pairKey,
          myRole: pair.members[user.uid].role,
          myName: pair.members[user.uid].name,
          members: pair.members,
          partnerNames: Object.entries(pair.members)
            .filter(([id]) => id !== user.uid)
            .map(([, m]) => m.name),
        };
      }
    }
    return null;
  }, [roomData, user]);

  return {
    user,
    role,
    setRole,
    roomCode,
    roomData,
    error,
    setError,
    timerValue,
    // Teacher
    teacherLogin,
    teacherLogout,
    createRoom,
    randomizePairs,
    startGame,
    nextQuestion,
    endGame,
    deleteRoom,
    // Student
    joinRoom,
    submitAnswer,
    leaveRoom,
    getMyPairInfo,
  };
}
