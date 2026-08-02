// Title: Football Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=iOpRqAgRzb0
// Source: https://tinyurl.com/57fzxvet

// Normal Sudoku. The source's grey circles are two 1-to-7 player routes. Each
// straight segment has an 8 or a 9 strictly between its consecutive players;
// the final Or preserves the source's undecided assignment of those two teams.
const givens = [
  ['R1C1', 1], ['R1C4', 2], ['R1C7', 7], ['R2C2', 2], ['R2C5', 3],
  ['R3C2', 9], ['R3C9', 3], ['R4C4', 3], ['R4C7', 4], ['R5C5', 4],
  ['R5C8', 5], ['R6C2', 1], ['R7C3', 6], ['R7C7', 5], ['R8C4', 7],
  ['R8C8', 6], ['R9C1', 7], ['R9C8', 1],
];

const routes = [
  ['R6C2', 'R2C2', 'R2C5', 'R5C5', 'R5C8', 'R8C8', 'R8C4'],
  ['R1C1', 'R1C4', 'R4C4', 'R4C7', 'R7C7', 'R7C3', 'R9C1'],
];

const parse = (cell) => cell.match(/R(\d+)C(\d+)/).slice(1).map(Number);
const segment = (from, to) => {
  const [r1, c1] = parse(from);
  const [r2, c2] = parse(to);
  const count = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));
  const dr = Math.sign(r2 - r1);
  const dc = Math.sign(c2 - c1);
  return Array.from({ length: count + 1 }, (_, i) => makeCellId(r1 + dr * i, c1 + dc * i));
};

// The state records a fixed segment position and whether its required separator
// appeared before the final player. It therefore checks a literal 1-to-7 hop.
const hop = (from, to, player, separator) => {
  const cells = segment(from, to);
  const encoded = NFA.encodeSpec({
    startState: { pos: 0, seen: false },
    transition: ({ pos, seen }, value) => {
      if (pos === 0) return value === player ? { pos: 1, seen: false } : undefined;
      if (pos === cells.length - 1) {
        return value === player + 1 && seen ? { pos: cells.length, seen } : undefined;
      }
      return { pos: pos + 1, seen: seen || value === separator };
    },
    accept: ({ pos, seen }) => pos === cells.length && seen,
    maxDepth: cells.length,
  }, 9);
  return new NFA(encoded, `football-${separator}-${player}`, cells);
};

const routeFor = (route, separator) => route.slice(1).map(
  (to, i) => hop(route[i], to, i + 1, separator));

const football = new Or([
  new And([...routeFor(routes[0], 8), ...routeFor(routes[1], 9)]),
  new And([...routeFor(routes[0], 9), ...routeFor(routes[1], 8)]),
]);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  football,
];
