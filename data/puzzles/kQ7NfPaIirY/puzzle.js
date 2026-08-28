// Title: Consecutive Path Sudoku
// Author: Brandon Dong
// Video: https://www.youtube.com/watch?v=kQ7NfPaIirY
// Source: https://app.crackingthecryptic.com/webapp/pgBDpmmFFM

// Normal sudoku rules apply (rows, columns and the default 3x3 boxes).
//
// For each 1 digit on the board, there exists a path starting at that 1, which
// then connects to a 2, which then connects to a 3 ... all the way to 9, using
// only orthogonally adjacent cells. Paths of different 1s may share cells, and a
// digit that lies on no path is unconstrained.
//
// Nothing else is drawn on the board; no rule is omitted.

const CHAINED = 1;    // chain-flag values, stored in the Var cells
const UNCHAINED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// One flag Var per grid cell (VC1..VC81, in grid order): CHAINED means the cell's
// own digit d starts an orthogonally adjacent run d, d+1, ..., 9.
const chain = graph.makeOverlay('VC');

const gridCells = graph.cells();

// Givens, transcribed from the 17 filled cells drawn on the board.
const givens = [
  ['R1C5', 5], ['R1C9', 8],
  ['R2C3', 8], ['R2C9', 6],
  ['R3C4', 2], ['R3C6', 8],
  ['R4C1', 8], ['R4C4', 5], ['R4C8', 9],
  ['R5C1', 1], ['R5C8', 8],
  ['R6C5', 8],
  ['R7C4', 8], ['R7C5', 7],
  ['R8C7', 8],
  ['R9C2', 8], ['R9C3', 1],
].map(([cell, digit]) => new Given(cell, digit));

// --- The chain flag, defined and applied, one machine per cell. ---
// Cell list: the cell's digit, the cell's flag, then each orthogonal neighbour's
// digit and flag. Reading both members of every pair lets one machine state the
// flag's defining equivalence
//
//   CHAINED(c)  <=>  digit(c) == 9  or  some neighbour n has
//                    digit(n) == digit(c) + 1 and CHAINED(n)
//
// as a local condition. The equivalence is a definition, not a choice: a flag
// depends only on flags of strictly larger digits, so the dependency graph is
// acyclic and the flags are fixed by the digits alone (all 9s CHAINED, then the
// 8s, and so on down). The puzzle's rule is then the single extra demand that
// every 1 be CHAINED, rejected in the `flag` phase below.
//
// State fields: `digit`/`chained` are the machine's own cell, read first;
// `found` records whether a CHAINED successor has been seen among the
// neighbours so far; `successor` holds, between a neighbour's two cells,
// whether that neighbour's digit is digit + 1.
const chainMachine = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', digit: value };
    }
    if (state.phase === 'flag') {
      if (value !== CHAINED && value !== UNCHAINED) return undefined;
      // The rule: a 1 must start a full 1-to-9 chain.
      if (state.digit === 1 && value === UNCHAINED) return undefined;
      return {
        phase: 'scan', digit: state.digit,
        chained: value === CHAINED, found: false,
      };
    }
    if (state.phase === 'scan') {
      return {
        phase: 'peek', digit: state.digit, chained: state.chained,
        found: state.found, successor: value === state.digit + 1,
      };
    }
    if (value !== CHAINED && value !== UNCHAINED) return undefined;
    return {
      phase: 'scan', digit: state.digit, chained: state.chained,
      found: state.found || (state.successor && value === CHAINED),
    };
  },
  accept: (state) =>
    state.phase === 'scan' &&
    state.chained === (state.digit === 9 || state.found),
}, geometry.numValues);

const chainFlags = gridCells.map(cell => new NFA(
  chainMachine, 'chain',
  cell, chain.at(cell),
  ...graph.neighbours(cell).flatMap(n => [n, chain.at(n)])));

return [
  new Shape('9x9'),
  ...givens,
  chain.toVar('chain'),
  chain.makeReplicate(new Given(chain.cells()[0], CHAINED, UNCHAINED)),
  ...chainFlags,
];
