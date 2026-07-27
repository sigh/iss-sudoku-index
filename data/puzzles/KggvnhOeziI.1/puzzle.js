// Title: Differences Count - part 3
// Author: Sujoyku and Marty Sears
// Video: https://www.youtube.com/watch?v=KggvnhOeziI
// Source: https://sudokupad.app/xuyeywkw3y

// Normal 9x9 sudoku rules apply (default row/column/box all-different).
//
// Fourteen separate coloured-line strokes are drawn (each its own entry in
// the source geometry, so each is its own line for the rule below, even
// where several strokes share a colour but not a cell). Along each line:
// the difference between an adjacent pair equals the number of adjacent
// pairs on that same line sharing that difference. This is a
// self-referential count, so for every possible difference value t, the
// number of pairs on the line with difference t must be either 0 or
// exactly t -- encoded below with one NFA per (line, t), same reduction as
// part 1 of this series (x9ZTPlo2P6M).
//
// Two black dots sit on cell edges: the two digits at each are in a 1:2
// ratio (BlackDot).

// digits 1-9, so the largest possible |a - b| is 8.
const MAX_DIFF = 8;

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
    }, 9);
    return new NFA(spec, name, ...cells);
  });
}

// Cell lists transcribed from each drawn line's waypoints; the rule is
// symmetric in adjacent pairs, so traversal direction does not matter.
// Line 9 is a closed loop in the source data (its waypoints return to the
// first cell), so its first cell is repeated at the end to cover the
// wrap-around pair, per the standard closed-loop convention for
// sequential-pair line constraints.
const colouredLines = [
  ['R8C3', 'R9C3'],
  ['R3C2', 'R2C2', 'R1C1', 'R2C1'],
  ['R5C5', 'R5C6'],
  ['R4C1', 'R5C1'],
  ['R3C3', 'R3C4', 'R4C5', 'R3C6', 'R3C7'],
  ['R9C1', 'R8C1', 'R7C1'],
  ['R3C9', 'R4C9', 'R5C8', 'R6C8', 'R7C7', 'R7C6', 'R8C6', 'R9C7'],
  ['R6C1', 'R6C2', 'R7C2', 'R7C3'],
  ['R9C6', 'R9C5', 'R8C4', 'R7C5', 'R6C5', 'R6C6', 'R5C7', 'R4C8', 'R3C8', 'R2C7', 'R1C6'],
  ['R2C3', 'R2C4', 'R1C4', 'R1C3', 'R2C3'],
  ['R8C2', 'R9C2'],
  ['R5C3', 'R6C3'],
  ['R4C3', 'R4C4', 'R3C5', 'R2C6', 'R1C5'],
  ['R2C8', 'R1C9', 'R2C9'],
];

const selfCountingConstraints = colouredLines.flatMap(
  (cells, i) => selfCountingLine(`line${i}`, cells));

return [
  new Shape('9x9'),

  ...selfCountingConstraints,

  new BlackDot('R8C1', 'R8C2'),
  new BlackDot('R1C5', 'R1C6'),
];
