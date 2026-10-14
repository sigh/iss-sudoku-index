// Title: Range Circles
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=HEJDSZGS3iw
// Source: https://sudokupad.app/8mn0c13uyk

// Normal 6x6 sudoku with 2x3 boxes. Each circled digit equals the
// maximum minus minimum among its surrounding in-grid cells.
const shape = new Shape('6x6');
const graph = cellGraph(shape);
// Circles drawn at these cell centres.
const circles = ['R1C2', 'R1C1', 'R2C1', 'R3C1', 'R6C1',
  'R6C3', 'R4C5', 'R3C4', 'R1C6', 'R2C4'];
// Read the circle first, then track only the neighbours' running extrema.
const rangeSpec = NFA.encodeSpec({
  startState: { target: null, min: 7, max: 0 },
  transition: ({ target, min, max }, value) => {
    if (target === null) return { target: value, min, max };
    const nextMin = Math.min(min, value);
    const nextMax = Math.max(max, value);
    if (nextMax - nextMin > target) return undefined;
    return { target, min: nextMin, max: nextMax };
  },
  accept: ({ target, min, max }) => target !== null && max - min === target,
}, shape);
const ranges = circles.map(cell => new NFA(rangeSpec, 'Range circle',
  [cell, ...graph.kingNeighbours(cell)]));
return [shape, ...ranges];
