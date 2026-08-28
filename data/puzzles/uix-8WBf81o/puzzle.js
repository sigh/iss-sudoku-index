// Title: Food Fight
// Author: Unknown
// Video: https://www.youtube.com/watch?v=uix-8WBf81o
// Source: https://cracking-the-cryptic.web.app/sudoku/G7QF3bQ7TM

// Standard sudoku. Twelve lines (six columns, six rows) each carry two
// outside-clue numbers, one at each end. Every such line has both:
//   - a Sandwich clue: sum of digits strictly between the 1 and the 9, and
//   - a Battlefield clue: two armies advance inward from the line's two
//     ends, each army's length equal to the first digit seen from its end
//     (so the end cell is the army's own near edge). The clue is the sum of
//     the digits in the gap between the armies if they do not meet, or the
//     sum of the digits common to both armies (once) if they overlap.
// The payload draws the two numbers on a line identically (same style, no
// colour/marker distinguishing them), so which end is the sandwich total and
// which is the battlefield total is not decodable from the source. Both
// assignments are encoded as a disjunction, except on column 7 where the two
// printed numbers are equal and no disjunction is needed.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Battlefield zone-sum NFA. Scans a line's 9 cells and checks that the sum of
// the digits in the "contested" zone (the gap between the two armies, or
// their overlap) equals N.
//
// Let X = value of cells[0] (near end), Y = value of cells[8] (far end).
// The armies occupy cells[0..X-1] (near) and cells[9-Y..8] (far), 0-indexed.
// Writing position i in 1..9 (1-indexed, matching the printed cell order),
// a case split on whether the armies overlap (X+Y >= 10) or leave a gap
// (X+Y <= 9) shows both cases collapse to one membership rule:
//   in_zone(i)  <=>  (i <= X) === (i + Y >= 10)
// (both sides false: i is past the near army and before the far army, i.e.
// the gap; both sides true: i is within reach of both armies, i.e. the
// overlap). The state machine reads the far-end cell first (revealing Y),
// then the near-end cell (revealing X and, with it, whether each end cell
// itself falls in the zone), then the remaining 7 cells in order, testing
// the membership rule at each with i implicit in the scan position.
function zoneSumSpec(N) {
  const SINK = N + 1; // once the running sum can only fail, stop tracking it exactly
  return NFA.encodeSpec({
    startState: { phase: 0, tmp: 0, leftRem: 0, rightCd: 0, sum: 0 },
    transition: (state, value) => {
      const { phase, tmp, leftRem, rightCd, sum } = state;
      if (phase === 0) {
        // Consuming the far-end cell -> Y.
        return { phase: 1, tmp: value, leftRem: 0, rightCd: 0, sum: 0 };
      }
      if (phase === 1) {
        // Consuming the near-end cell -> X. tmp holds Y.
        const x = value, y = tmp;
        let edge = 0;
        if (y === 9) edge += x; // near-end cell (i=1) is in zone iff Y===9
        if (x === 9) edge += y; // far-end cell (i=9) is in zone iff X===9
        // leftRem: count of middle positions i in 2..8 with i <= X.
        const leftRem0 = Math.max(Math.min(x - 1, 7), 0);
        // rightCd: count of middle positions i in 2..8 with i + Y < 10,
        // i.e. steps remaining before the far army's reach begins.
        const rightCd0 = Math.max(Math.min(8 - y, 7), 0);
        return {
          phase: 2, tmp: 0,
          leftRem: leftRem0, rightCd: rightCd0,
          sum: Math.min(edge, SINK),
        };
      }
      // phase 2: the 7 middle cells, positions 2..8 in order.
      const aActive = leftRem > 0;   // i <= X
      const bActive = rightCd <= 0;  // i + Y >= 10
      const inZone = aActive === bActive;
      const newSum = inZone ? Math.min(sum + value, SINK) : sum;
      return {
        phase: 2, tmp: 0,
        leftRem: aActive ? leftRem - 1 : 0,
        rightCd: rightCd > 0 ? rightCd - 1 : 0,
        sum: newSum,
      };
    },
    accept: (state) => state.phase === 2 && state.sum === N,
  }, 9);
}

// cells: the line's 9 cells in printed near-to-far order (cells[0] = near
// end, cells[8] = far end). The spec above wants far-end first.
function battlefield(value, cells) {
  const order = [cells[8], cells[0], ...cells.slice(1, 8)];
  return new NFA(zoneSumSpec(value), `battlefield ${value}`, ...order);
}

function sandwich(value, cells) {
  return Sandwich.fromCells(value, cells, geometry);
}

// A two-clue line: `near` and `far` are the two printed numbers (at cells[0]
// and cells[8] respectively). Which one is the sandwich total and which is
// the battlefield total is not decodable from the source, so encode the
// disjunction over both assignments -- collapsing to a plain conjunction
// when the two numbers are equal, since then there is nothing to disjoin
// over.
function foodFightLine(cells, near, far) {
  if (near === far) {
    return [sandwich(near, cells), battlefield(near, cells)];
  }
  return [new Or([
    new And([sandwich(near, cells), battlefield(far, cells)]),
    new And([sandwich(far, cells), battlefield(near, cells)]),
  ])];
}

// Provenance: the printed outside-clue numbers at each line's near and far
// ends, in board order.
const lines = [
  // columns: near = top, far = bottom
  foodFightLine(graph.column(1), 5, 18),
  foodFightLine(graph.column(3), 31, 5),
  foodFightLine(graph.column(4), 20, 21),
  foodFightLine(graph.column(5), 26, 0),
  foodFightLine(graph.column(7), 33, 33),
  foodFightLine(graph.column(9), 11, 20),
  // rows: near = left, far = right
  foodFightLine(graph.row(2), 9, 6),
  foodFightLine(graph.row(3), 0, 2),
  foodFightLine(graph.row(5), 6, 13),
  foodFightLine(graph.row(6), 21, 6),
  foodFightLine(graph.row(7), 1, 24),
  foodFightLine(graph.row(8), 5, 0),
];

return [
  new Shape('9x9'),
  ...lines.flat(),
];
