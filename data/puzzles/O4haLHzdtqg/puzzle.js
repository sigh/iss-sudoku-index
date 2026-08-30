// Title: World-Famous YouTuber Creates Genius Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=O4haLHzdtqg
// Source: https://cracking-the-cryptic.web.app/sudoku/BjDnndmJF7

// Normal sudoku rules apply (rows, columns, 3x3 boxes). Nine thermometers are
// drawn: five are normal (bulb holds the smallest digit, values increase away
// from the bulb) and four are broken (bulb holds the biggest digit, values
// decrease away from the bulb). Which five are normal is not stated by the
// rules or the art -- it is deduced while solving -- so each thermometer's
// polarity is a solver-chosen flag, constrained only by the 5-normal/4-broken
// split. Two thermometers share a bulb at R3C7; the rules say explicitly they
// need not share a polarity, so each keeps its own independent flag.

// Nine thermometer paths, bulb cell first, transcribed from the nine drawn
// strokes (two more stroke entries carry no coordinates and draw nothing).
// Bulb identity for each confirmed against the drawn red-bordered circle at
// that cell.
const THERMOS = [
  ['R9C9', 'R8C9', 'R7C9', 'R6C9'],                                   // line #0
  ['R7C7', 'R7C6', 'R6C6', 'R6C7', 'R6C8', 'R7C8', 'R8C8', 'R8C7'],   // line #2
  ['R6C3', 'R7C3', 'R7C4', 'R7C5', 'R6C5'],                           // line #3
  ['R4C3', 'R5C3', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4'],   // line #4
  ['R3C1', 'R3C2', 'R2C2'],                                           // line #5
  ['R2C2', 'R2C3', 'R1C3', 'R1C4', 'R1C5'],                           // line #7
  ['R3C7', 'R4C7', 'R4C6', 'R4C5', 'R4C4', 'R4C3'],                   // line #8
  ['R3C7', 'R3C6', 'R2C6'],                                           // line #9
  ['R3C8', 'R2C8', 'R1C8', 'R1C9'],                                   // line #10
];

// One flag cell per thermometer: 1 = normal (increasing from the bulb),
// 2 = broken (decreasing from the bulb). `ContainExact` below pins the count
// to exactly five 1s; since each flag's domain is restricted to {1, 2}, the
// remaining four are forced to 2.
const flags = new Var('M', 'thermo polarity flags', THERMOS.length);
const flagCells = flags.cells();

// Scans [flag, bulb, ..., tip]. The flag symbol picks a mode in the first
// two states, then every later value must strictly continue in that mode's
// direction from the previous cell -- increasing for 'normal', decreasing
// for 'broken'. No transition rejects outright (returns undefined), which is
// how a wrong-direction step is excluded; every reachable state accepts.
const polaritySpec = {
  startState: { stage: 'flag' },
  transition: ({ stage, mode, prev }, value) => {
    if (stage === 'flag') {
      return { stage: 'bulb', mode: value === 1 ? 'normal' : 'broken' };
    }
    if (stage === 'bulb') {
      return { stage: 'run', mode, prev: value };
    }
    if (mode === 'normal') {
      if (value <= prev) return undefined;
    } else {
      if (value >= prev) return undefined;
    }
    return { stage: 'run', mode, prev: value };
  },
  accept: () => true,
};
const polarityNFA = NFA.encodeSpec(polaritySpec, 9);

return [
  new Shape('9x9'),
  new Given('R9C9', 5),

  flags,
  ...flagCells.map((cell) => new Given(cell, 1, 2)),
  new ContainExact(Array(5).fill(1).join('_'), ...flagCells),

  ...THERMOS.map((cells, i) =>
    new NFA(polarityNFA, 'thermoPolarity', [flagCells[i], ...cells])),
];
