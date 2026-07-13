// Title: Foggy Chess
// Author: PjoeterBliep
// Video: https://www.youtube.com/watch?v=m5EVai6r_VA
// Source: https://sudokupad.app/fmthex6o9i

// Normal sudoku, no givens. A fixed layout of chess pieces sits on top of the
// grid (fog/reveal state is a display aid, not a rule about the finished
// grid, so it is not encoded). Each piece's own cell still holds a normal
// sudoku digit. A WHITE piece's digit counts how many of the squares it
// could legally move to right now (following normal chess movement,
// blocking, capturing and check-avoidance rules against this fixed piece
// layout) hold a digit different from its own; a BLACK piece's digit counts
// how many of its legal-move squares hold the SAME digit as its own (not
// counting its own square).
//
// Because every piece's position and colour is fixed by the puzzle (only
// the sudoku digits are unknown), which squares each piece could legally
// move to does not depend on the solution at all - it is a fixed geometric
// fact about the static board. That set was computed once, offline, by a
// full chess legal-move generator (pseudo-legal generation per piece type,
// including two-square pawn advances from each colour's starting rank,
// diagonal-only pawn captures, sliding-piece blocking, and a check-avoidance
// filter that removes any move exposing the moving side's own king), and
// was verified to reproduce the known solution digit at every one of the 20
// pieces before being hard-coded below. Only the resulting fixed target-cell
// lists are used here; no chess logic runs inside the solver.
//
// ENCODED HERE (validated against the known solution): normal sudoku plus,
// for every one of the 20 chess pieces, the count-equals-own-digit clue
// (different-valued targets for White, same-valued targets for Black) via a
// small NFA that reads the piece's own cell first (fixing the target count)
// and then scans its fixed legal-move cells, counting matches. Nothing is
// omitted.

const graph = cellGraph('9x9');
const numValues = graph.gridGeometry().numValues;

// cell: the piece's own square. color: 'W' or 'B'. targets: the piece's
// fixed legal-move squares on this static board (see header).
const pieces = [
  { cell: 'R9C8', color: 'W', piece: 'King', targets: ['R9C9', 'R9C7'] },
  { cell: 'R8C8', color: 'W', piece: 'Pawn', targets: ['R7C7'] },
  { cell: 'R8C9', color: 'W', piece: 'Pawn', targets: ['R7C9', 'R6C9', 'R7C8'] },
  { cell: 'R7C8', color: 'B', piece: 'Bishop', targets: ['R8C9', 'R8C7', 'R9C6', 'R6C9', 'R6C7', 'R5C6', 'R4C5', 'R3C4', 'R2C3', 'R1C2'] },
  { cell: 'R7C7', color: 'B', piece: 'Bishop', targets: ['R8C8', 'R8C6', 'R9C5', 'R6C8', 'R5C9', 'R6C6', 'R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C1'] },
  { cell: 'R9C5', color: 'W', piece: 'Queen', targets: ['R9C6', 'R9C7', 'R9C4', 'R9C3', 'R9C2', 'R9C1'] },
  { cell: 'R9C1', color: 'B', piece: 'Queen', targets: ['R8C1', 'R7C1', 'R6C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R8C2', 'R7C3', 'R6C4'] },
  { cell: 'R6C3', color: 'B', piece: 'Knight', targets: ['R7C5', 'R8C4', 'R5C5', 'R4C4', 'R7C1', 'R8C2', 'R5C1', 'R4C2'] },
  { cell: 'R4C6', color: 'B', piece: 'King', targets: ['R4C5', 'R5C7', 'R3C7', 'R3C5'] },
  { cell: 'R3C7', color: 'W', piece: 'Pawn', targets: ['R2C7', 'R2C6'] },
  { cell: 'R2C6', color: 'B', piece: 'Pawn', targets: ['R3C6', 'R3C7'] },
  { cell: 'R5C3', color: 'B', piece: 'Pawn', targets: ['R6C4'] },
  { cell: 'R6C4', color: 'W', piece: 'Pawn', targets: ['R5C4', 'R5C3'] },
  { cell: 'R6C5', color: 'W', piece: 'Bishop', targets: ['R7C6', 'R8C7', 'R7C4', 'R8C3', 'R9C2', 'R5C6', 'R4C7', 'R3C8', 'R2C9', 'R5C4', 'R4C3'] },
  { cell: 'R4C3', color: 'B', piece: 'Knight', targets: ['R5C5', 'R6C4', 'R3C5', 'R2C4', 'R5C1', 'R6C2', 'R3C1', 'R2C2'] },
  { cell: 'R4C8', color: 'W', piece: 'Knight', targets: ['R6C9', 'R2C9', 'R5C6', 'R6C7', 'R3C6', 'R2C7'] },
  { cell: 'R1C1', color: 'W', piece: 'Bishop', targets: ['R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7'] },
  { cell: 'R6C1', color: 'W', piece: 'Rook', targets: ['R7C1', 'R8C1', 'R9C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R6C2', 'R6C3'] },
  { cell: 'R1C9', color: 'W', piece: 'Knight', targets: ['R2C7', 'R3C8'] },
  { cell: 'R1C3', color: 'W', piece: 'Rook', targets: ['R2C3', 'R3C3', 'R4C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C2'] },
];

// Reads [pieceCell, target1, target2, ...]. The first cell fixes the target
// count (its own digit); each later cell increments the count if it matches
// (white: differs from the piece's digit; black: equals it). Accepts iff the
// final count equals the piece's own digit. Count is capped once it can no
// longer possibly equal a single digit, to keep the state space small.
const pieceCountNFA = isMatch => NFA.encodeSpec({
  startState: null,
  transition: (state, value) => {
    if (state === null) return { target: value, count: 0 };
    const { target, count } = state;
    const next = count + (isMatch(value, target) ? 1 : 0);
    if (next > 9) return undefined;
    return { target, count: next };
  },
  accept: (state) => state !== null && state.count === state.target,
}, numValues);

const whiteNFA = pieceCountNFA((value, target) => value !== target);
const blackNFA = pieceCountNFA((value, target) => value === target);

return [
  new Shape('9x9'),
  ...pieces.map(({ cell, color, piece, targets }) => {
    const spec = color === 'W' ? whiteNFA : blackNFA;
    return new NFA(spec, `${color === 'W' ? 'white' : 'black'}-${piece}-${cell}`, cell, ...targets);
  }),
];
