// Title: The Whispering Forest
// Author: Atticus837
// Video: https://www.youtube.com/watch?v=5igcFy0q5pk
// Source: https://sudokupad.app/wqqeaa26jf

// Normal 6x6 sudoku rules apply.
//
// Adjacent digits on a green vine differ by at least 3.
const VINES = [
  ['R2C1', 'R3C1', 'R4C2', 'R5C2', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R2C2', 'R1C2'],
  ['R5C2', 'R6C1'],
  ['R2C5', 'R3C5', 'R4C4', 'R5C4'],
  ['R1C3', 'R2C3'],
];

// Sir Doku starts on 1 at R6C1, makes chess-knight moves through
// 2, 3, 4, and 5 in order, then reaches 6 at R2C6.
const START = 'R6C1';
const DESTINATION = 'R2C6';
const KNIGHT_STEPS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const enumerateRoutes = () => {
  const routes = [];

  const extend = path => {
    if (path.length === 6) {
      if (path[path.length - 1] === DESTINATION) routes.push(path);
      return;
    }

    const { row, col } = parseCellId(path[path.length - 1]);
    for (const [dr, dc] of KNIGHT_STEPS) {
      const nextRow = row + dr;
      const nextCol = col + dc;
      if (nextRow < 1 || nextRow > 6 || nextCol < 1 || nextCol > 6) continue;

      const next = makeCellId(nextRow, nextCol);
      if (!path.includes(next)) extend([...path, next]);
    }
  };

  extend([START]);
  return routes;
};

const knightRoute = new Or(enumerateRoutes().map(route => new And(
  route.slice(1, -1).map((cell, i) => new Given(cell, i + 2)),
)));

return [
  new Shape('6x6'),
  ...VINES.map(cells => new Whisper(3, ...cells)),
  new Given(START, 1),
  new Given(DESTINATION, 6),
  knightRoute,
];
