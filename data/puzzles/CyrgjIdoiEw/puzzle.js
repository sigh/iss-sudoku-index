// Title: Counting Shadows
// Author: Andrea Acciatelli
// Video: https://www.youtube.com/watch?v=CyrgjIdoiEw
// Source: https://sudokupad.app/1vyiko0v3g

// Normal Sudoku; box-position matches are shaded. Each circle counts shaded
// cells on its line, including itself. Dots are exhaustive between different
// lines only. Quad circles require all printed digits in their four cells.
const shape = new Shape('9x9');
// The five colored strokes, starting at their matching colored circles.
const lines = [["R2C2", "R3C2", "R4C2", "R5C2", "R6C2", "R7C2", "R7C3", "R7C4", "R7C5", "R7C6", "R7C7", "R6C7", "R5C7", "R4C7", "R3C7", "R2C7"], ["R1C1", "R2C1", "R3C1", "R4C1", "R5C1", "R6C1", "R7C1", "R8C1", "R9C1", "R9C2", "R9C3", "R9C4", "R9C5", "R9C6", "R9C7", "R9C8", "R9C9", "R8C9", "R7C9", "R6C9", "R5C9", "R4C9", "R3C9", "R2C9", "R1C9"], ["R1C2", "R1C3", "R1C4", "R1C5", "R1C6", "R1C7", "R1C8", "R2C8", "R3C8", "R4C8", "R5C8", "R6C8", "R7C8", "R8C8", "R8C7", "R8C6", "R8C5", "R8C4", "R8C3", "R8C2"], ["R2C3", "R2C4", "R2C5", "R2C6", "R3C6", "R4C6", "R5C6", "R6C6", "R6C5", "R6C4", "R6C3"], ["R3C3", "R4C3", "R5C3", "R5C4", "R5C5", "R4C5", "R3C5", "R3C4", "R4C4"]];
// Small white and black edge dots, respectively, in their drawn order.
const white = [["R8C1", "R8C2"], ["R8C2", "R9C2"], ["R7C3", "R8C3"], ["R3C1", "R3C2"], ["R1C2", "R2C2"], ["R1C6", "R2C6"], ["R6C6", "R6C7"], ["R4C7", "R4C8"], ["R5C5", "R5C6"], ["R2C8", "R2C9"], ["R6C2", "R6C3"], ["R6C8", "R6C9"], ["R6C6", "R7C6"], ["R2C4", "R3C4"]];
const black = [["R1C4", "R2C4"], ["R1C5", "R2C5"], ["R8C6", "R9C6"], ["R7C6", "R8C6"], ["R8C4", "R9C4"], ["R4C5", "R4C6"], ["R4C8", "R4C9"]];
const position = cell => {
  const {row,col} = parseCellId(cell);
  return ((row-1)%3)*3 + (col-1)%3 + 1;
};
// State records the current cell index, circle target, and matches so far.
// Reading the circle first both sets the target and counts its own shading.
const counts = lines.map(line => {
  const positions = line.map(position);
  const spec = NFA.encodeSpec({
    startState: {i:0, target:0, count:0},
    transition: ({i,target,count}, v) => {
      if (i >= line.length) return undefined;
      const nextTarget = i === 0 ? v : target;
      const nextCount = count + (v === positions[i] ? 1 : 0);
      if (nextCount > nextTarget) return undefined;
      return {i:i+1, target:nextTarget, count:nextCount};
    },
    accept: ({i,target,count}) => i === line.length && count === target,
    maxDepth: line.length,
  }, shape);
  return new NFA(spec, 'Shaded count', line);
});
const owner = new Map(lines.flatMap((line,i) => line.map(cell => [cell,i])));
const edgeKey = (a,b) => [a,b].sort().join('|');
const marked = new Set([...white,...black].map(([a,b]) => edgeKey(a,b)));
const graph = cellGraph('9x9');
// An undotted edge between different strokes is neither consecutive nor 2:1.
const noDot = Pair.fnToKey((a,b) => Math.abs(a-b)!==1 && a!==2*b && b!==2*a, shape);
const negatives = graph.cells().flatMap(a => graph.neighbours(a)
  .filter(b => a < b && owner.get(a)!==owner.get(b) && !marked.has(edgeKey(a,b)))
  .map(b => new Pair(noDot, 'No cross-line dot', a,b)));
return [shape, ...counts,
  ...white.map(edge => new WhiteDot(...edge)),
  ...black.map(edge => new BlackDot(...edge)),
  ...negatives,
  // The three medium white circles and their printed digits.
  new Quad('R2C5',3,6), new Quad('R2C4',1), new Quad('R6C4',4),
];
