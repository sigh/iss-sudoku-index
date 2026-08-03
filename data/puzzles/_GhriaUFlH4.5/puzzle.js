// Title: August 11, 2023: What Next?
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=_GhriaUFlH4
// Source: https://tinyurl.com/r6rvkm22

// Normal Sudoku rules apply. Each outside clue lists the set of digit(s)
// orthogonally adjacent to 9 in its indicated row or column. Two-digit clues
// allow either order; a one-digit clue puts 9 at that line's corresponding end.
// The givens and the 18 clue sets below are transcribed from the source payload.
const graph = cellGraph('9x9');
const givens = [
  ['R1C9', 1], ['R2C8', 2], ['R3C7', 3], ['R4C6', 4], ['R5C5', 5],
  ['R6C4', 6], ['R7C3', 7], ['R8C2', 8], ['R9C1', 9],
];
const clues = [
  ['R1', '14'], ['R2', '58'], ['R3', '36'], ['R4', '14'], ['R5', '58'],
  ['R6', '36'], ['R7', '25'], ['R8', '5'], ['R9', '5'],
  ['C1', '3'], ['C2', '67'], ['C3', '78'], ['C4', '67'], ['C5', '12'],
  ['C6', '34'], ['C7', '23'], ['C8', '2'], ['C9', '23'],
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
