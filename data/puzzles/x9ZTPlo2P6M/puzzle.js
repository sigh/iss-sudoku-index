// Title: 1: Small Differences Count
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=x9ZTPlo2P6M
// Source: https://sudokupad.app/7yld3jef5j

// Normal 4x4 sudoku rules apply (default row/column/box all-different).
//
// Five separate coloured-line strokes are drawn (each its own entry in the
// source geometry, so each is its own line for the rule below, even the two
// that happen to share a colour but not a cell). Along each line: the
// difference between an adjacent pair equals the number of adjacent pairs on
// that same line sharing that difference. This is a self-referential count,
// so for every possible difference value t, the number of pairs on the line
// with difference t must be either 0 or exactly t -- encoded below with one
// NFA per (line, t).
//
// A black dot sits on the edge between R4C3 and R4C4: the two digits there
// are in a 1:2 ratio (BlackDot).

// digits 1-4, so the largest possible |a - b| is 3.
const MAX_DIFF = 3;

function selfCountingLine(name, cells) {
  return Array.from({ length: MAX_DIFF + 1 }, (_, t) => {
    const spec = NFA.encodeSpec({
      startState: { prev: null, count: 0 },
      transition: ({ prev, count }, value) => {
        if (prev === null) return { prev: value, count };
        const diff = Math.abs(value - prev);
        // Clamp at t+1: once count exceeds t the line can only fail, so
        // collapse every higher count to one sink value.
        return { prev: value, count: Math.min(count + (diff === t ? 1 : 0), t + 1) };
      },
      // "count(t) in {0, t}": either no adjacent pair on this line has
      // difference t, or exactly t of them do -- the self-referential rule
      // reduced to a per-target invariant.
      accept: ({ count }) => count === 0 || count === t,
    }, 4);
    return new NFA(spec, name, ...cells);
  });
}

// Cell order transcribed from each drawn line's waypoints; the rule is
// symmetric in adjacent pairs, so traversal direction does not matter.
const colouredLines = [
  ['R1C2', 'R1C3'],
  ['R2C1', 'R2C2'],
  ['R1C1', 'R1C2'],
  ['R2C2', 'R2C3'],
  ['R1C4', 'R2C4', 'R3C3', 'R3C2', 'R3C1', 'R4C1', 'R4C2'],
];

const selfCountingConstraints = colouredLines.flatMap(
  (cells, i) => selfCountingLine(`line${i}`, cells));

return [
  new Shape('4x4'),

  ...selfCountingConstraints,

  new BlackDot('R4C3', 'R4C4'),
];
