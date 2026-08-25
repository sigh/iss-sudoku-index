// Title: Kuromasudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=2gsXTT-yWgE
// Source: https://app.crackingthecryptic.com/webapp/9qMJNmR7Gj

// Normal sudoku (default 3x3 boxes) plus a discovered grey/non-grey shading:
// no two grey cells orthogonally adjacent, and the non-grey cells form one
// orthogonally-connected region. Each of 18 clue cells prints a target that
// is the sum of the digits "seen" from it looking N/S/E/W, counting its own
// digit once; grey cells block sight along a ray, and a clue cell is never
// grey. Digits may repeat within one clue's field of vision -- no extra
// distinctness rule follows from that sentence, so nothing extra is encoded
// for it.

const UNSHADED = 1;
const SHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// Sight-line clues: cell -> printed total, from each clue's drawn top-left
// corner text.
const clues = {
  R1C1: 11, R6C1: 11, R1C2: 7, R3C2: 8, R2C4: 19, R3C4: 9,
  R1C5: 14, R1C8: 13, R2C8: 21, R3C7: 12, R4C7: 16, R4C8: 15,
  R6C7: 12, R8C8: 13, R9C9: 36, R8C5: 9, R8C1: 22, R4C5: 10,
};

// One multi-segment NFA per clue. Segment 0 is the origin cell alone (its
// digit always counts, since a clue cell can't be grey). Each remaining
// segment is one compass ray (cells in distance order, nearest first),
// interleaved as [digit, shadeFlag, digit, shadeFlag, ...] so the machine can
// read both a cell's value and whether it blocks sight in one scan.
// `stopped` latches at the first SHADED flag seen in a ray -- that cell's own
// digit is not added, since a grey cell is itself unseen, not merely opaque
// beyond itself -- and is re-armed at every SEGMENT_BREAK, since each
// direction's visibility is independent. `sum` clamps at target+1: once a
// branch can only fail, further additions are inert (bounds the state count).
function sightSumSpec(target) {
  return NFA.encodeSpec({
    startState: { phase: 'origin', sum: 0, stopped: false, pending: 0 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        return { phase: 'ray-digit', sum: state.sum, stopped: false, pending: 0 };
      }
      if (state.phase === 'origin') {
        return {
          phase: 'origin',
          sum: Math.min(state.sum + value, target + 1),
          stopped: false, pending: 0,
        };
      }
      if (state.phase === 'ray-digit') {
        // Buffer this cell's digit until its shade flag arrives.
        return { phase: 'ray-flag', sum: state.sum, stopped: state.stopped, pending: value };
      }
      // phase === 'ray-flag': value is this cell's shade flag.
      if (state.stopped || value === SHADED) {
        return { phase: 'ray-digit', sum: state.sum, stopped: true, pending: 0 };
      }
      return {
        phase: 'ray-digit',
        sum: Math.min(state.sum + state.pending, target + 1),
        stopped: false, pending: 0,
      };
    },
    // Every clue here has at least one non-empty ray, so the final state is
    // always 'ray-digit' (reached right after each ray's last flag).
    accept: (state) => state.phase === 'ray-digit' && state.sum === target,
  }, 9, { multiSegment: true });
}

const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // N, S, W, E

const specByTarget = new Map();
const sightSumConstraints = Object.entries(clues).map(([origin, target]) => {
  if (!specByTarget.has(target)) specByTarget.set(target, sightSumSpec(target));
  const rays = DIRECTIONS
    .map(([dr, dc]) => graph.ray(origin, dr, dc).slice(1))
    .filter(cells => cells.length > 0)
    .map(cells => cells.flatMap(cell => [cell, shade.at(cell)]));
  return new NFA(specByTarget.get(target), 'VSUM', [origin], ...rays);
});

// No two grey cells orthogonally adjacent: one Pair per row and per column of
// the shade overlay applies the relation to every consecutive (= orthogonally
// adjacent) pair in that line, which covers every adjacent cell exactly once.
// fnToKey's lookup table is sized by the grid's own alphabet (9), regardless
// of the shade overlay's narrower {UNSHADED, SHADED} domain, so the count
// here must be 9, not 2 -- passing 2 decodes the truth table at the wrong
// size and silently corrupts every pair (values 3-9 never actually occur on
// a shade cell, so the extra rows are inert).
const notBothShaded = Pair.fnToKey((a, b) => !(a === SHADED && b === SHADED), 9);
const noAdjacentGrey = [...shade.rows(), ...shade.columns()]
  .map(line => new Pair(notBothShaded, 'no adjacent grey', ...line));

return [
  new Shape('9x9'),
  shade.toVar('grey'),
  // Every shade cell's domain is {UNSHADED, SHADED}, not the grid's 1-9.
  shade.makeReplicate(new Given(shade.cells()[0], UNSHADED, SHADED)),
  ...Object.keys(clues).map(cell => new Given(shade.at(cell), UNSHADED)),
  new ConnectedValues('VS', UNSHADED),
  ...noAdjacentGrey,
  ...sightSumConstraints,
];
