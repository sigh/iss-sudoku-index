// Title: Next to Nine Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=RO5rLcSoeBg
// Source: https://tinyurl.com/5n7tfsby

// Normal Sudoku rules apply. Each outside clue lists the set of digit(s)
// orthogonally adjacent to 9 in its indicated row or column. Two-digit clues
// allow either order; a one-digit clue puts 9 at that line's corresponding end.
// The givens and the 16 clue sets below are transcribed from the source payload.
const graph = cellGraph('9x9');
const givens = [
  ['R1C2', 9], ['R2C9', 9], ['R3C6', 9], ['R4C3', 9],
  ['R6C7', 9], ['R7C4', 9], ['R8C1', 9], ['R9C8', 9],
];
const clues = [
  ['R1', '12'], ['R2', '8'], ['R3', '56'], ['R4', '15'],
  ['R6', '37'], ['R7', '78'], ['R8', '6'], ['R9', '34'],
  ['C1', '14'], ['C2', '7'], ['C3', '58'], ['C4', '48'],
  ['C6', '26'], ['C7', '67'], ['C8', '5'], ['C9', '23'],
];

function nextToNinePattern(clue) {
  if (clue.length === 1) {
    // A one-digit clue means the 9 has one neighbour, so it is at an endpoint.
    return `(9${clue}.*|.*${clue}9)`;
  }
  const [a, b] = clue;
  return `.*(${a}9${b}|${b}9${a}).*`;
}

function lineCells(line) {
  return line[0] === 'R' ? graph.row(`${line}C1`) : graph.column(`R1${line}`);
}

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...clues.map(([line, clue]) =>
    new Regex(nextToNinePattern(clue), ...lineCells(line))),
];
