// Title: Chess-doku
// Author: masetab
// Video: https://www.youtube.com/watch?v=cAj0gZA5ccE
// Source: https://sudokupad.app/p4f84nlzhv

// Rules encoded:
// - Normal 8x8 Sudoku with the standard 2x4 boxes; givens R1C1=8, R2C8=7.
// - Digits separated by a white kropki dot are consecutive.
// - Each circled cell is a chess piece on the corresponding square (R1 is
//   rank 8, R8 is rank 1, C1 is file a; White moves up, towards R1). Every
//   piece type+colour that appears has one digit; all white digits are below
//   all black digits; within a colour digits follow P < N < B < R < Q < K.
//   Not all types need appear.
// - White and Black have identical material (same count of each type).
// - No piece attacks a piece of the opposite colour, defended or not.
// - "The position is legal" and "no pawn promotions have occurred" are
//   encoded only through their checkable consequences on the drawn position:
//   exactly one king per side; per-side ceilings of 8 pawns, 2 knights,
//   2 bishops, 2 rooks, 1 queen; no pawn on rank 1 or 8; two bishops of one
//   colour on opposite-coloured squares.
// Omitted: "It is White to move, and White has a checkmate in one", and the
// game-history remainder of "legal" / "no promotions".
//
// Model: a class code per piece: 0 = digit used by no piece, 1-6 = white
// P,N,B,R,Q,K, 7-12 = black P,N,B,R,Q,K. VD1..VD8 hold the code of each digit
// 1-8; the VC overlay holds the code of each circled cell.

const shape = new Shape('8x8', '0-12');
const graph = cellGraph(shape);

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8];
const TYPES = ['P', 'N', 'B', 'R', 'Q', 'K'];
const CODES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const codeOf = (colour, type) => TYPES.indexOf(type) + 1 + (colour === 'W' ? 0 : 6);
const typeOf = code => TYPES[(code - 1) % 6];
const isWhite = code => code <= 6;
// Per-side ceilings from "no pawn promotions"; the king's is also its floor.
const CAP = { P: 8, N: 2, B: 2, R: 2, Q: 1, K: 1 };

// The 22 circled cells, row-major, from the large white circles drawn on the
// grid.
const circleCells = [
  'R1C1', 'R1C3', 'R1C4',
  'R2C2', 'R2C3', 'R2C8',
  'R3C5', 'R3C7', 'R3C8',
  'R4C1', 'R4C2', 'R4C4',
  'R5C1', 'R5C4',
  'R6C1', 'R6C6', 'R6C8',
  'R7C3', 'R7C5', 'R7C6', 'R7C7',
  'R8C2',
];
const circleSet = new Set(circleCells);

// White kropki dots, from the small white edge circles.
const whiteDots = [
  ['R1C5', 'R1C6'],
  ['R4C6', 'R5C6'],
  ['R5C6', 'R6C6'],
  ['R5C7', 'R6C7'],
  ['R5C7', 'R5C8'],
];

const cls = graph.makeOverlay('VC', circleCells);
const clsCells = cls.at(circleCells);
const digitClass = new Var('D', 'class code of each digit 1-8 (0 = no piece)', 8);
const vd = digitClass.cells();

// Codes rise with the digit: white before black, hierarchy order within a
// colour, no code twice. Unused digits (code 0) may sit anywhere.
const classOrderNFA = NFA.encodeSpec({
  startState: { last: 0 },
  transition: ({ last }, code) =>
    code === 0 ? { last } : (code > last ? { last: code } : undefined),
  accept: () => true,
}, shape);

// Scans [circle digit, VD1..VD8, VC]: the circle's code is the code of its
// digit. Phases: 'digit' reads the grid digit d, 'scan' walks VD up to VD_d,
// 'carry' holds VD_d's code through the rest of VD, then compares it to VC.
const circleLinkNFA = NFA.encodeSpec({
  startState: { phase: 'digit' },
  transition: (s, v) => {
    switch (s.phase) {
      case 'digit':
        return DIGITS.includes(v) ? { phase: 'scan', d: v, pos: 0 } : undefined;
      case 'scan': {
        const pos = s.pos + 1;
        return pos === s.d ? { phase: 'carry', code: v, pos } : { ...s, pos };
      }
      case 'carry':
        if (s.pos < 8) return { ...s, pos: s.pos + 1 };
        return v === s.code ? { phase: 'done' } : undefined;
    }
    return undefined;
  },
  accept: s => s.phase === 'done',
}, shape);

// Scans [VD1..VD8, circle digits]: every digit with a nonzero code is on some
// circle, so a code is assigned only to a piece that exists. `mask` collects
// the digits with a code while reading VD, then drops each digit seen on a
// circle; the reverse direction (a circle's digit has a code) is the link NFA.
const codesUsedNFA = NFA.encodeSpec({
  startState: { pos: 0, mask: 0 },
  transition: ({ pos, mask }, v) => pos < 8
    ? { pos: pos + 1, mask: v === 0 ? mask : mask | (1 << pos) }
    : { pos, mask: mask & ~(1 << (v - 1)) },
  accept: ({ mask }) => mask === 0,
}, shape);

// One per type over the 22 circle codes: White's count equals Black's, neither
// exceeds the ceiling, and each side has exactly one king.
const materialNFA = type => NFA.encodeSpec({
  startState: { w: 0, b: 0 },
  transition: ({ w, b }, code) => {
    if (code === codeOf('W', type)) w++;
    if (code === codeOf('B', type)) b++;
    return (w > CAP[type] || b > CAP[type]) ? undefined : { w, b };
  },
  accept: ({ w, b }) => w === b && (type !== 'K' || w === 1),
}, shape);

// Geometry of attacks between two circles, read off the fixed circle layout:
// the piece codes at `from` that attack `to`. Sliding pieces need every cell
// strictly between them empty (not circled).
const rc = cell => {
  const { row, col } = parseCellId(cell);
  return [row, col];
};
const clearBetween = ([r0, c0], [r1, c1], dr, dc) => {
  for (let r = r0 + dr, c = c0 + dc; r !== r1 || c !== c1; r += dr, c += dc) {
    if (circleSet.has(makeCellId(r, c))) return false;
  }
  return true;
};
const bothColours = types => types.flatMap(t => [codeOf('W', t), codeOf('B', t)]);
const attackers = (from, to) => {
  const dR = to[0] - from[0];
  const dC = to[1] - from[1];
  const adR = Math.abs(dR);
  const adC = Math.abs(dC);
  if ((adR === 1 && adC === 2) || (adR === 2 && adC === 1)) return bothColours(['N']);
  const orth = (dR === 0) !== (dC === 0);
  const diag = adR === adC;
  if (!orth && !diag) return [];
  const adjacent = Math.max(adR, adC) === 1;
  if (!adjacent && !clearBetween(from, to, Math.sign(dR), Math.sign(dC))) return [];
  const types = orth ? ['R', 'Q'] : ['B', 'Q'];
  if (adjacent) types.push('K');
  const codes = bothColours(types);
  // Pawns capture one step diagonally forward: white towards R1, black towards R8.
  if (diag && adjacent && dR === -1) codes.push(codeOf('W', 'P'));
  if (diag && adjacent && dR === 1) codes.push(codeOf('B', 'P'));
  return codes;
};

// One Pair per pair of circles that could interact: neither attacks the other
// across colours, and two same-colour bishops are not on same-coloured squares.
const piecePairs = circleCells.flatMap((a, i) => circleCells.slice(i + 1).flatMap(b => {
  const pa = rc(a);
  const pb = rc(b);
  const attackAB = attackers(pa, pb);
  const attackBA = attackers(pb, pa);
  const sameSquareColour = (pa[0] + pa[1]) % 2 === (pb[0] + pb[1]) % 2;
  if (!attackAB.length && !attackBA.length && !sameSquareColour) return [];
  const key = Pair.fnToKey((x, y) => {
    if (x === 0 || y === 0) return true;  // not pieces; excluded by the VC domain
    if (isWhite(x) !== isWhite(y) && (attackAB.includes(x) || attackBA.includes(y))) return false;
    if (sameSquareColour && x === y && typeOf(x) === 'B') return false;
    return true;
  }, shape);
  return [new Pair(key, `${a}-${b}`, cls.at(a), cls.at(b))];
}));

const rankOf = cell => 9 - parseCellId(cell).row;
const nonPawnCodes = CODES.filter(code => typeOf(code) !== 'P');

return [
  shape,
  new Given('R1C1', 8),
  new Given('R2C8', 7),
  // Grid cells hold digits 1-8; the wider range is for the class codes.
  graph.makeReplicate(new Given('R1C1', ...DIGITS)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),

  cls.toVar('piece class of each circled cell'),
  digitClass,
  cls.makeReplicate(new Given(clsCells[0], ...CODES)),
  ...circleCells.filter(cell => rankOf(cell) === 1 || rankOf(cell) === 8)
    .map(cell => new Given(cls.at(cell), ...nonPawnCodes)),

  new NFA(classOrderNFA, 'digit order', ...vd),
  ...circleCells.map(cell => new NFA(circleLinkNFA, `class of ${cell}`, cell, ...vd, cls.at(cell))),
  new NFA(codesUsedNFA, 'codes are pieces', ...vd, ...circleCells),
  ...TYPES.map(type => new NFA(materialNFA(type), `material ${type}`, ...clsCells)),
  ...piecePairs,
];
