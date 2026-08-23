// Title: Accelero-meter
// Author: Derek Orr
// Video: https://www.youtube.com/watch?v=mvXRoxdrWyc
// Source: https://app.crackingthecryptic.com/sudoku/BGDJ3tD8Fg
//
// Normal sudoku rules apply (standard rows/columns/boxes, default Shape).
// A thermometer is the genre-standard shape (strictly increasing digits from
// the bulb, as ISS's own Thermo class enforces); "act like accelerometers"
// layers a further rule onto that base meaning: reading each thermo tip-ward
// from its bulb, the consecutive digit differences must themselves strictly
// increase along the whole thermo. Requiring the first (bulb-to-next) step to
// be positive gives the base monotonic-increase behaviour; because the
// differences are then required to keep strictly increasing, every later
// step is automatically positive too, so no separate positivity check is
// needed past the first step.

return [
  new Shape('9x9'),

  new Given('R1C7', 7),

  // Each thermo is scanned bulb-first by one Accelerometer NFA. State carries
  // the previous cell's value and the previous step's signed difference;
  // a transition is rejected once a new difference fails to exceed the last
  // one, or (for the first step) is not positive. The first cell has no
  // difference yet.
  ...(() => {
    const spec = NFA.encodeSpec({
      startState: { prev: null, prevDiff: null },
      transition: ({ prev, prevDiff }, value) => {
        if (prev === null) return { prev: value, prevDiff: null };
        const diff = value - prev;
        if (prevDiff === null) {
          return diff > 0 ? { prev: value, prevDiff: diff } : undefined;
        }
        if (diff > prevDiff) return { prev: value, prevDiff: diff };
        return undefined;
      },
      accept: () => true,
    }, 9);

    // Thermo cell paths, bulb cell first.
    const thermos = [
      ['R2C9', 'R1C8', 'R1C9'],
      ['R3C9', 'R3C8', 'R2C8', 'R1C7'],
      ['R2C6', 'R2C7', 'R1C6'],
      ['R3C4', 'R3C3', 'R4C3'],
      ['R1C2', 'R1C1', 'R2C1', 'R3C1'],
      ['R7C1', 'R6C1', 'R5C1', 'R5C2'],
      ['R9C1', 'R9C2', 'R8C3', 'R7C3'],
      ['R5C6', 'R5C5', 'R4C5', 'R4C4'],
      ['R4C7', 'R4C8', 'R5C8'],
      ['R6C9', 'R6C8', 'R7C8'],
      ['R7C9', 'R8C9', 'R9C9'],
      ['R7C6', 'R8C7', 'R7C7', 'R8C8'],
    ];

    return thermos.map(
      (cells, i) => new NFA(spec, `accel${i}`, cells));
  })(),
];
