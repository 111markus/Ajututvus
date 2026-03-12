import { useState, useEffect, useCallback } from "react";
import { ref, set, onValue, update, push, remove } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth, signInPlayer } from "../firebase";

/**
 * Custom hook for managing a real-time card game with Firebase.
 *
 * Game structure in Realtime Database:
 * /games/{gameId}/
 *   players/
 *     {uid}: { name, hand: [...], connected: true }
 *   deck: [...]
 *   discard: [...]
 *   turn: "uid"
 *   status: "waiting" | "playing" | "finished"
 */

// Build a standard 52-card deck
function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = [
    "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K",
  ];
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, id: `${rank}${suit}` });
    }
  }
  return deck;
}

// Fisher-Yates shuffle
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useCardGame() {
  const [user, setUser] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  // Auth: sign in anonymously on mount
  useEffect(() => {
    signInPlayer().catch((err) => setError(err.message));

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // Listen to game state in real-time
  useEffect(() => {
    if (!gameId) return;

    const gameRef = ref(db, `games/${gameId}`);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      setGameState(snapshot.val());
    });

    return () => unsubscribe();
  }, [gameId]);

  // Create a new game room
  const createGame = useCallback(
    async (playerName = "Player 1") => {
      if (!user) return;
      try {
        const gamesRef = ref(db, "games");
        const newGameRef = push(gamesRef);
        const newGameId = newGameRef.key;

        const deck = shuffle(createDeck());
        const hand = deck.splice(0, 7); // Deal 7 cards to creator

        await set(newGameRef, {
          status: "waiting",
          deck,
          discard: [],
          turn: user.uid,
          players: {
            [user.uid]: {
              name: playerName,
              hand,
              connected: true,
            },
          },
          createdAt: Date.now(),
        });

        setGameId(newGameId);
        return newGameId;
      } catch (err) {
        setError(err.message);
      }
    },
    [user]
  );

  // Join an existing game room
  const joinGame = useCallback(
    async (id, playerName = "Player 2") => {
      if (!user) return;
      try {
        const gameRef = ref(db, `games/${id}`);
        // Read current deck to deal cards
        const { deck: currentDeck } = (
          await new Promise((resolve) =>
            onValue(gameRef, (snap) => resolve(snap.val()), { onlyOnce: true })
          )
        ) || { deck: [] };

        const hand = currentDeck.splice(0, 7); // Deal 7 cards

        await update(ref(db, `games/${id}/players`), {
          [user.uid]: {
            name: playerName,
            hand,
            connected: true,
          },
        });

        // Update remaining deck and set status to "playing"
        await update(ref(db, `games/${id}`), {
          deck: currentDeck,
          status: "playing",
        });

        setGameId(id);
      } catch (err) {
        setError(err.message);
      }
    },
    [user]
  );

  // Play a card from your hand
  const playCard = useCallback(
    async (cardIndex) => {
      if (!user || !gameId || !gameState) return;
      if (gameState.turn !== user.uid) return; // Not your turn!

      const myHand = [...gameState.players[user.uid].hand];
      const [playedCard] = myHand.splice(cardIndex, 1);

      const playerIds = Object.keys(gameState.players);
      const currentIndex = playerIds.indexOf(user.uid);
      const nextPlayer = playerIds[(currentIndex + 1) % playerIds.length];

      const discard = gameState.discard ? [...gameState.discard, playedCard] : [playedCard];

      await update(ref(db, `games/${gameId}`), {
        [`players/${user.uid}/hand`]: myHand,
        discard,
        turn: nextPlayer,
      });
    },
    [user, gameId, gameState]
  );

  // Draw a card from the deck
  const drawCard = useCallback(async () => {
    if (!user || !gameId || !gameState) return;
    if (gameState.turn !== user.uid) return;

    const deck = [...(gameState.deck || [])];
    if (deck.length === 0) return;

    const drawnCard = deck.pop();
    const myHand = [...gameState.players[user.uid].hand, drawnCard];

    await update(ref(db, `games/${gameId}`), {
      deck,
      [`players/${user.uid}/hand`]: myHand,
    });
  }, [user, gameId, gameState]);

  // Leave / delete the game
  const leaveGame = useCallback(async () => {
    if (!user || !gameId) return;
    await remove(ref(db, `games/${gameId}/players/${user.uid}`));
    setGameId(null);
    setGameState(null);
  }, [user, gameId]);

  return {
    user,
    gameId,
    gameState,
    error,
    createGame,
    joinGame,
    playCard,
    drawCard,
    leaveGame,
  };
}
