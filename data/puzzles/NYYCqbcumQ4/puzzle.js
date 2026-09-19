// Title: Killer Sandwich
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=NYYCqbcumQ4
// Source: https://rjrudman.github.io/penpa-edit/?m=solve&p=1ZfJzis1E4b3uYxeol60hx6cLcMKsQB+IRRFiAVi84vDIBZ8n869n+ctu6o74gpQErted3VNg+389cffP//5y5wWfcsxM/Op6bBfPjb9bo+FB3yet8eUpnnK/NL0vL2/fXt/f/vp/nh+nN/+d5Lf3d+nskz3Ok8lTffClPtU+lT7tPZp69Pep6NPzabaOde+uHcpR38hLajQnDpTyp0r1c6WVvFhzjf3d8aEUS3x6DHlfZrTcwbCgUtlwIygx/TZQLLrISM73NAG3DpMi4xB1Hg3pcNebgPm1t9eBi6rsW+ELilEP5pNX9mYbfye2M1vxcYvbFw0Tr9/+P8/v374jbdZ+tpYv8SVnMmPPE2ZhNR0AZmsVay1B8ucVywTvdY5b8RI9MbbGzE2us15H/w7/Ds5M/79pGtBDhky+fBXMmk0cvKQk+FXDtwGwhz8KgfRBfmqCaMxWoVhdEYmITNdvKtom22yZ9i/Y0PQ8O/Dhh05yobR+LhTV0av0EPmjsx92LNJzqArtm1DToG/Dl8KclSfRsOvknU7VcUew2PoPVhXykW3bS6p288M3f1lhu78zNBDTmsnfWBDGzbIr8N9wZ5jxPY45rIMOYvkdL0lrRe6Qvd3kQ3d7ec5dPedGbrLZIbueo1n5It5LmpC0RWZ6kTR1MZJwz9qo6zYoL4zfvxdhw3UBvi0Z9SGxUdtZzzIV/ubXuxRy2TK/Qcr+s97/85NrvAaoM5N9WyAZDQVsQGquKly+5N2AcSIBQcFaRjYgUSThQ42gIsmNk311UXDpiLsoLJvquSFoNZXaE9dPjZp6fUhkRpwEyQoA+5A5aBDssAwfOBpu8BGmWvJET6pAbrlcj182vEpXJeDQ13bFEh/Z0sAd5D2Y+EKPA4bcVDjdIDSbfgCAQjRivfplsVgiBAFVId2iOkv0J4OFQ4jfhZ6d1SUYIR+PwSHs1AK5wmzKTqt4sxj7dVId5o8NU8TxNwOL7KDcKj9O5B1OjFGwpRO1fKAMqeF303MLVxpuJKqM0MBV8891Jzy4sxQgq4ICqjNskNSxOCKoOZkW4JBNTaDK1LPp+KFLUrQFUEJeoCLknOBVJbWAhJg2z+GXjF7eQEJsO2yw2aYWQtI6lgLf8W8uKLEBq21iBXMrAVUJltUQVFjtMhksS7ykj/Eq1tGR5T54fVLu7HggJL1Tuzp99Ygq82TCjE3TykEwJuGfDa3qWHhCbCPBQcoDeNMdFQkpzZD1Eu1eoni4nxhiOJqVlxnSBQwHQ89fhwQDB4SKEEXBSUYsVcqrlCFeaZiITOsBcRI1kIvwbYr2bDZMnN6pB7TpeHqYJQAJwhD1EuH7iCUqinqlI2aIeqUUyAVPwagcOEK7WmUbYfREGxVDK4XSkXtLkDN3CVdEZSgvwsl6O9W7f0nLJzdWgvJ1i7ur05qrQW0dnHmvIrZjyLFRdEIZm4yDKcig+GvNr6qS1W3iusKQ7jArYbBFUEJ+rtQgq4IChhFCCXoVkEJRjS4szFENKokX6D01tCrYmAtoOIcxVDVtawFlORojcplTGvhr4zUhWxAy+C5D+GRXXMH1E4TtZFVDKy9wthZVRs5agMKGLWhe3Kyi0vXq9ooURtQQD8oRAlGAeusKL73QBGNC9TRz1pAlUrUle6EWrtCuxMPKBdik9aF+QWi1y7NwyNCZ/fmrmiVVfqrMKBStkRtLKoNXWo71B/GqnvteKosBNQlUGsBVd66CF4VhRnazXJsFANGjrS52YV4QLVGbG66/TJE6LRBnTBXRTI2KIM5zlUowfOpohEw6ZyxPwMDatuMcybpAGftFcbGqPM8x3me1QtXaE8jKR1G1amPSuyixOUK+Y+JIv39HVCxik7Rfz2GOPzVsPY/bUCVSsB0KBrRdIn/HVp7VWRGcvWuXMA/3m4PXUP/9eHF/9ra8xM=

// Rules: normal Sudoku and killer Sudoku rules. A strip of gray cells sits
// above and to the left of the 9x9 grid. Every gray cell inside a dashed cage
// holds a number (0, one-digit or two-digit) that is a member of that cage: it
// counts toward the cage total, and none of its digits may repeat within the
// cage (so 11, 22, 33 are excluded). That same number is a sandwich clue: it
// equals the sum of the digits between the 1 and the 9 in the Sudoku column
// below it (top strip) or the Sudoku row beside it (left strip). The printed
// corner numbers are the cage totals; the `*` on the top-C5 gray cell says
// its number has two digits. Cages with no printed total are no-repeat only.
// A 0 digit never clashes with a Sudoku digit (the gray strip is outside the
// grid, so gray numbers are subject to no row/column/box rule).

// The grid alphabet is widened to 0-9 so the gray numbers' digits can be 0;
// the grid cells themselves are pinned back to 1-9 below.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// Each gray number is held as two Var cells: its tens digit and its ones digit
// (a one-digit number has tens 0; the number 0 has both 0). Var row i is the
// i-th entry of `grayCells`.
const grayCells = [
  // [name, the Sudoku line the number is a sandwich clue for]
  ['top C2', graph.column(2)],
  ['top C3', graph.column(3)],
  ['top C5', graph.column(5)],
  ['top C8', graph.column(8)],
  ['left R1', graph.row(1)],
  ['left R3', graph.row(3)],
  ['left R5', graph.row(5)],
  ['left R6', graph.row(6)],
  ['left R7', graph.row(7)],
  ['left R8', graph.row(8)],
  ['left R9', graph.row(9)],
];
const grayVar = new Var('N', 'gray numbers (tens, ones)', `${grayCells.length}x2`);
const tens = name => grayVar.cell(grayCells.findIndex(g => g[0] === name) + 1, 1);
const ones = name => grayVar.cell(grayCells.findIndex(g => g[0] === name) + 1, 2);

// Dashed cages, transcribed from the drawn cage outlines: printed total (0 for
// none), the gray cells in the cage, and the Sudoku cells in the cage.
const cages = [
  [27, ['top C2'], ['R1C2']],
  [13, ['top C3'], ['R1C3', 'R2C2', 'R2C3']],
  [0, ['top C5'], ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5']],
  [35, ['top C8'], ['R1C8']],
  [36, ['left R1'], ['R1C1']],
  [23, ['left R3'], ['R2C1', 'R3C1']],
  [0, [], ['R2C6', 'R3C6', 'R3C7', 'R3C8']],
  [9, ['left R5', 'left R6'], []],
  [30, ['left R7'], ['R5C2', 'R6C1', 'R6C2', 'R7C1']],
  [0, [], ['R6C4', 'R7C4', 'R8C3', 'R8C4', 'R9C4']],
  [0, [], ['R6C6', 'R6C7', 'R6C8', 'R7C7', 'R8C7']],
  [62, ['left R8', 'left R9'], []],
  [0, [], ['R8C6', 'R9C6', 'R9C7', 'R9C8', 'R9C9']],
];

// Cage total: Sudoku digits plus each gray number as 10*tens + ones.
const cageTotals = cages
  .filter(([total]) => total > 0)
  .map(([total, grays, cells]) => new Sum(
    total, ...cells, ...grays.flatMap(g => [[tens(g), 10], [ones(g), 1]])));

// No repeats within a cage. Sudoku digits are pairwise distinct; each digit of
// a gray number is distinct from every Sudoku digit and every other gray digit
// in the cage unless it is 0 (0 is not a Sudoku digit, and only a two-digit
// number has a second digit, so tens = 0 is not a digit at all).
const distinctUnlessZero = Pair.fnToKey((a, b) => a === 0 || b === 0 || a !== b, shape);
const cageDistinct = cages.flatMap(([, grays, cells]) => {
  const grayDigits = grays.flatMap(g => [tens(g), ones(g)]);
  return [
    ...(cells.length > 1 ? [new AllDifferent(...cells)] : []),
    ...grayDigits.flatMap((d, i) => [
      ...grayDigits.slice(i + 1).map(e => new Pair(distinctUnlessZero, 'cage', d, e)),
      ...cells.map(c => new Pair(distinctUnlessZero, 'cage', d, c)),
    ]),
  ];
});

// Sandwich: the gray number equals the sum of the digits strictly between the
// 1 and the 9 of its line. Segments: the 9 line cells, then the tens cell, then
// the ones cell. Phases: 'pre' before the first crust, 'in' accumulating `sum`
// between the crusts, 'post' after the second crust; the two segment breaks
// then move to reading the tens and ones digits, and the machine accepts only
// when they spell `sum`.
const sandwichSpec = NFA.encodeSpec({
  startState: { p: 'pre' },
  transition: (s, v) => {
    if (v === SEGMENT_BREAK) {
      if (s.p === 'post') return { p: 'tens', sum: s.sum };
      if (s.p === 'tensRead') return { p: 'ones', sum: s.sum, tens: s.tens };
      return undefined;  // no complete sandwich in the line
    }
    switch (s.p) {
      case 'pre': return (v === 1 || v === 9) ? { p: 'in', sum: 0 } : s;
      case 'in': return (v === 1 || v === 9) ? { p: 'post', sum: s.sum } : { p: 'in', sum: s.sum + v };
      case 'post': return s;
      case 'tens': return { p: 'tensRead', sum: s.sum, tens: v };
      case 'ones': return (10 * s.tens + v === s.sum) ? { p: 'done' } : undefined;
      default: return undefined;
    }
  },
  accept: s => s.p === 'done',
  maxDepth: 13,  // 9 line cells + tens + ones + 2 segment breaks
}, shape, { multiSegment: true });
const sandwiches = grayCells.map(([name, line]) =>
  new NFA(sandwichSpec, 'sandwich', line, [tens(name)], [ones(name)]));

return [
  shape,
  grayVar,
  // Sudoku cells hold 1-9 only.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  // The starred gray cell holds a two-digit number: its tens digit is nonzero.
  new Given(tens('top C5'), 1, 2, 3, 4, 5, 6, 7, 8, 9),
  ...cageTotals,
  ...cageDistinct,
  ...sandwiches,
];
