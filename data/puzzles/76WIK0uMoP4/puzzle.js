// Title: Taco Sudoku
// Author: DiMono
// Video: https://www.youtube.com/watch?v=76WIK0uMoP4
// Source: https://app.crackingthecryptic.com/jq8DH93ND3

// Normal Sudoku rules apply. Each outside two-digit Taco clue has an inclusive
// line run whose endpoints are the clue's two digits and whose digit sum is the
// displayed number; the endpoints can occur in either order.

const graph = cellGraph('9x9');
const rows = graph.rows();
const columns = graph.columns();

function tacoMachine(total, first, last) {
  return NFA.encodeSpec({
    // Before the run, scan freely. At either endpoint, begin the only possible
    // inclusive run and retain its sum until the opposite endpoint is reached.
    startState: null,
    transition(state, value) {
      if (state === 'done') return 'done';
      if (state === null) {
        const starts = [null];
        if (value === first) starts.push({ needed: last, sum: value });
        if (value === last) starts.push({ needed: first, sum: value });
        return starts;
      }
      const sum = state.sum + value;
      if (sum > total) return undefined;
      if (value === state.needed) return sum === total ? 'done' : undefined;
      return { needed: state.needed, sum };
    },
    accept: state => state === 'done',
    maxDepth: 9,
  }, 9);
}

// The literal tables transcribe the displayed outside clue badges by side.
const clues = [
  [31, columns[0]], [15, columns[2]], [38, columns[4]], [13, columns[6]], [45, columns[8]],
  [14, columns[0]], [38, columns[2]], [35, columns[6]], [18, columns[8]],
  [12, rows[0]], [36, rows[2]], [23, rows[4]], [43, rows[8]],
  [25, rows[0]], [24, rows[2]], [24, rows[4]], [26, rows[8]],
];

const tacos = clues.map(([total, cells]) => {
  const first = Math.floor(total / 10);
  const last = total % 10;
  return new NFA(tacoMachine(total, first, last), `taco-${total}`, ...cells);
});

return [
  new Shape('9x9'),
  ...tacos,
];
