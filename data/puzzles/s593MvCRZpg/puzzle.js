// Title: Encaged Kropki
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=s593MvCRZpg
// Source: https://app.crackingthecryptic.com/webapp/dLT2fM8ddJ

// Normal sudoku rules apply (default 3x3 boxes). Digits in a cage sum to the
// clue in its top-left cell and cannot repeat (Cage). Every cage also hides
// Kropki dots on some of its internal orthogonally-adjacent cell pairs: a
// black dot marks a pair where one digit is exactly double the other, a
// white dot a consecutive pair. Every pair that actually is in one of these
// relations must carry the corresponding dot -- no qualifying pair is left
// unmarked ("all possible kropki dots would have to be given"). The cage's
// two-digit total states how many dots of each colour appear, in either
// colour order (a 21-cage: 2 black + 1 white, or 2 white + 1 black). A pair
// between a 1 and a 2 satisfies both relations (ratio 2:1 and consecutive)
// and may count toward either colour, per the rules' own example.
//
// Encoded as one multi-segment NFA per cage: one two-cell segment per
// internal edge, with edges computed from each cage's cell list (not
// hand-picked). State carries the running black/white dot tallies across
// segments and a 2-step read phase that resets at every SEGMENT_BREAK; a
// pair qualifying for both colours branches the state both ways. Accept
// requires the final tallies to match the cage total's two digits in either
// order, which also forces every non-qualifying pair to stay undotted, since
// only a qualifying pair increments a tally.

const graph = cellGraph('9x9');

// Cage cell lists and totals, transcribed from the puzzle's drawn cages.
const cages = [
  { total: 40, cells: ['R1C1', 'R2C1', 'R2C2', 'R1C2', 'R1C3', 'R1C4', 'R2C4', 'R3C4'] },
  { total: 11, cells: ['R3C1', 'R3C2', 'R3C3'] },
  { total: 10, cells: ['R5C1', 'R6C1', 'R6C2', 'R6C3'] },
  { total: 22, cells: ['R4C5', 'R6C5', 'R5C4', 'R5C5', 'R5C6'] },
  { total: 21, cells: ['R7C6', 'R8C6', 'R8C5', 'R7C7', 'R7C8', 'R8C8'] },
  { total: 33, cells: ['R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5'] },
  { total: 30, cells: ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C9', 'R1C9', 'R2C8'] },
  { total: 30, cells: ['R3C6', 'R3C7', 'R3C8', 'R3C9'] },
];

// Internal edges of a cage: pairs of its cells that are orthogonally
// grid-adjacent (potential hidden-dot positions).
function cageEdges(cells) {
  const set = new Set(cells);
  const edges = [];
  for (const cell of cells) {
    const right = graph.step(cell, 0, 1);
    if (right && set.has(right)) edges.push([cell, right]);
    const down = graph.step(cell, 1, 0);
    if (down && set.has(down)) edges.push([cell, down]);
  }
  return edges;
}

// One multi-segment NFA spec per (d1, d2) target pair: d1 and d2 are the
// cage total's tens and ones digits, the two dot-colour counts in either
// order. `cap` bounds each tally just past the larger target, since neither
// tally is ever compared past that point.
function kropkiCageSpec(d1, d2) {
  const cap = Math.max(d1, d2) + 1;
  return NFA.encodeSpec({
    startState: { phase: 0, first: null, black: 0, white: 0 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        // Between edges: back to phase 0, tallies carry over.
        return { phase: 0, first: null, black: state.black, white: state.white };
      }
      if (state.phase === 0) {
        // First cell of this edge.
        return { phase: 1, first: value, black: state.black, white: state.white };
      }
      // Second cell of this edge: decide the pair's eligible colour(s).
      const a = state.first, b = value;
      const isBlack = a === 2 * b || b === 2 * a;
      const isWhite = Math.abs(a - b) === 1;
      const results = [];
      if (isBlack) {
        results.push({
          phase: 0, first: null,
          black: Math.min(state.black + 1, cap), white: state.white,
        });
      }
      if (isWhite) {
        results.push({
          phase: 0, first: null,
          black: state.black, white: Math.min(state.white + 1, cap),
        });
      }
      if (!isBlack && !isWhite) {
        // Not eligible for a dot at all: no tally changes.
        results.push({ phase: 0, first: null, black: state.black, white: state.white });
      }
      return results.length === 1 ? results[0] : results;
    },
    accept: (state) =>
      state.phase === 0 &&
      ((state.black === d1 && state.white === d2) ||
        (state.black === d2 && state.white === d1)),
  }, 9, { multiSegment: true });
}

const cageConstraints = cages.map(({ total, cells }) => new Cage(total, ...cells));

const kropkiConstraints = cages.map(({ total, cells }) => {
  const d1 = Math.floor(total / 10);
  const d2 = total % 10;
  const edges = cageEdges(cells);
  const spec = kropkiCageSpec(d1, d2);
  return new NFA(spec, `cage ${total} kropki dots`, ...edges);
});

return [
  new Shape('9x9'),
  ...cageConstraints,
  ...kropkiConstraints,
];
