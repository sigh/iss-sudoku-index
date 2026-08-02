// Title: Triple Threat
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=8swp3pYKkYM
// Source: https://app.crackingthecryptic.com/JG3BQrB63T

// Normal Sudoku rules apply. Each outside number is both its diagonal's little-killer
// total and a look-and-say count: its first digit counts occurrences of its second
// digit on that diagonal. It is also the sandwich total of its indicated row or column.
// The listed diagonal paths and V edges are transcribed from the drawn clues.
const geometry = cellGeometry('9x9');
const graph = cellGraph(geometry);
const diagonals = [
  { total: 15, digit: 5, count: 1, cells: graph.ray('R1C3', 1, -1) },
  { total: 35, digit: 5, count: 3, cells: graph.ray('R8C9', -1, -1) },
  { total: 19, digit: 9, count: 1, cells: graph.ray('R9C4', -1, 1) },
  { total: 22, digit: 2, count: 2, cells: graph.ray('R9C6', -1, 1) },
  { total: 22, digit: 2, count: 2, cells: graph.ray('R9C6', -1, -1) },
];

function countDigit(digit, target, cells) {
  // State is the number of target digits seen; target + 1 is an over-count sink.
  const spec = NFA.encodeSpec({
    startState: 0,
    transition: (count, value) => Math.min(count + (value === digit), target + 1),
    accept: count => count === target,
    maxDepth: cells.length,
  }, 9);
  return new NFA(spec, `exactly ${target} ${digit}s`, cells);
}

return [
  new Shape('9x9'),
  ...diagonals.map(({ total, cells }) => LittleKiller.fromCells(total, cells, geometry)),
  ...diagonals.map(({ digit, count, cells }) => countDigit(digit, count, cells)),
  Sandwich.fromCells(15, graph.column('R1C4'), geometry),
  Sandwich.fromCells(35, graph.row('R9C1'), geometry),
  Sandwich.fromCells(19, graph.column('R1C3'), geometry),
  Sandwich.fromCells(22, graph.column('R1C5'), geometry),
  Sandwich.fromCells(22, graph.column('R1C7'), geometry),
  new V('R2C5', 'R2C6'),
  new V('R3C9', 'R4C9'),
  new V('R2C2', 'R3C2'),
];
