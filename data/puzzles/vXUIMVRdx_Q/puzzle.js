// Title: Stinky Stuffing
// Author: the_cogito
// Video: https://www.youtube.com/watch?v=vXUIMVRdx_Q
// Source: https://sudokupad.app/fawimvf33u

// Normal sudoku rules apply. FullRankTies('none') makes all 36 directed row
// and column numbers distinct. Each outside clue is both its directed number's
// rank and the orientation-independent sandwich sum for that line.
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const fixedClues = [
  [graph.row(1), 23],              // R1 from the left
  [graph.column(1), 24],           // C1 from the top
  [graph.column(9).reverse(), 25], // C9 from the bottom
  [graph.row(9).reverse(), 26],    // R9 from the right
];

const fixedFullRanks = fixedClues.map(
  ([cells, value]) => FullRank.fromCells(value, cells, geometry));
const fixedSandwiches = fixedClues.map(
  ([cells, value]) => Sandwich.fromCells(value, cells, geometry));

// A question mark is one shared unknown value for the two clue types. Rank 36
// cannot be a sandwich sum, and sum 0 cannot be a rank, leaving values 1-35.
const unknownClue = cells => new Or(
  Array.from({length: 35}, (_, index) => {
    const value = index + 1;
    return new And([
      FullRank.fromCells(value, cells, geometry),
      Sandwich.fromCells(value, cells, geometry),
    ]);
  }));

return [
  new Shape('9x9'),
  new Given('R5C5', 2),
  new Diagonal(-1),
  new FullRankTies('none'),
  ...fixedFullRanks,
  ...fixedSandwiches,
  unknownClue(graph.row(2)),           // R2 from the left
  unknownClue(graph.row(8).reverse()), // R8 from the right
];
