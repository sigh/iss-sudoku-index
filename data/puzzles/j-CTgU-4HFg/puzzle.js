// Title: Schrodoku
// Author: Berdy
// Video: https://www.youtube.com/watch?v=j-CTgU-4HFg
// Source: https://sudokupad.app/zweh6b2lya

// Uncaged cells are filled without Sudoku repeats. Caged cells stay blank
// on the answer board (inert zero). Each caged cell has two complete
// variant-Sudoku completions, agreeing on all uncaged digits and differing
// at that cell. The pre-solve explanation at 10:31-10:48 describes multiple
// solutions and inability to resolve cages from all filled uncaged digits.
const shape = new Shape('9x9', '0-9', 'Raw');
const graph = cellGraph(shape);
// The eight shaded cages drawn on the board.
const cages = [
  ['R1C1','R1C2','R2C1'], ['R1C9','R2C9'], ['R5C2'],
  ['R5C4','R6C4'], ['R5C6'], ['R6C1'], ['R9C4'], ['R9C6'],
];
const blank = new Set(cages.flat());
const houses = [...graph.rows(), ...graph.columns(),
  ...[1,4,7].flatMap(r => [1,4,7].map(c => graph.block(makeCellId(r,c),3,3)))];
const filled = graph.rows().flat().filter(c => !blank.has(c));
// Line paths and dots drawn on the board, including caged cells.
const whispers = [['R6C1','R7C1'], ['R3C4','R4C4','R5C3']];
const renbans = [
  ['R9C6','R9C7','R9C8','R9C9','R8C9','R8C8'],
  ['R2C7','R3C7','R4C8','R5C7','R6C7','R7C8'],
  ['R2C5','R1C4','R2C3','R3C3','R4C3'],
];
const whiteDots = [['R2C9','R3C9'], ['R3C2','R3C3']];
const blackDots = [['R5C4','R6C4'], ['R4C2','R4C3']];
const cagedCells = [...blank];
// A base completion and one alternative per caged cell share every uncaged
// digit. Each overlay supplies only the twelve caged digits, so all Sudoku
// houses and every variant clue must be repeated over each completion.
const layers = Array.from({length:cagedCells.length+1}, (_,i) =>
  graph.makeOverlay('V'+String.fromCharCode(65+i), cagedCells));
// Dots are Pair relations because the overlay cells have no grid adjacency.
const consecutive = Pair.fnToKey((a,b) => Math.abs(a-b) === 1, shape);
const ratio = Pair.fnToKey((a,b) => a === 2*b || b === 2*a, shape);
const completions = layers.flatMap(layer => {
  const map = cell => blank.has(cell) ? layer.at(cell) : cell;
  return [layer.toVar('Completion'),
    ...cagedCells.map(c => new Given(map(c),1,2,3,4,5,6,7,8,9)),
    ...houses.map(h => new AllDifferent(...h.map(map))),
    ...whispers.map(l => new Whisper(5,...l.map(map))),
    ...renbans.map(l => new Renban(...l.map(map))),
    ...whiteDots.map(l => new Pair(consecutive,'Consecutive',...l.map(map))),
    ...blackDots.map(l => new Pair(ratio,'Double',...l.map(map))),
  ];
});
return [shape,
  ...cagedCells.map(c => new Given(c,0)),
  graph.makeReplicate(new Given('R1C1',1,2,3,4,5,6,7,8,9), filled),
  ...completions,
  ...cagedCells.map((c,i) => new AllDifferent(
    layers[0].at(c),layers[i+1].at(c))),
];
