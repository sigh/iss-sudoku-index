// Title: Unique Islands Of Nine
// Author: Scruffamudda
// Video: https://www.youtube.com/watch?v=TKAe_oGU9Rc
// Source: https://tinyurl.com/bdctjfbj

// Standard Sudoku; islands sum to 9 with distinct digit-support sets;
// islands connect orthogonally and may touch only at drawn bridges.
// The ocean connects orthogonally, fills no 2x2, and circles count sightlines
// within their own region, including themselves.
const AND=(...xs)=>new And(xs);
const OR=(...xs)=>new Or(xs);
const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const hi = graph.makeOverlay('VH');
const lo = graph.makeOverlay('VL');
const depth = graph.makeOverlay('VD');
const sea = graph.makeOverlay('VS');
const out = [];
const cells = [];
for (let r=1;r<=9;r++) for(let c=1;c<=9;c++) cells.push(makeCellId(r,c));
const H=c=>hi.at(c), L=c=>lo.at(c), D=c=>depth.at(c), S=c=>sea.at(c);
const eq=(a,b)=>new SameValues(2,a,b);
const code=k=>[Math.floor(k/9)+1,k%9+1];
// The finite support catalogue follows from positive digits summing to 9;
// repeated digits affect the sum but do not create a new support.
const supports = [[1], [1, 2], [1, 2, 3], [1, 2, 4], [1, 2, 5], [1, 2, 6], [1, 3], [1, 3, 4], [1, 3, 5], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [2, 3], [2, 3, 4], [2, 5], [2, 7], [3], [3, 6], [4, 5], [9]];
// Drawn orange bridge endpoints and outlined circle positions.
const bridges = [["R7C1", "R6C2"], ["R4C5", "R5C6"], ["R9C5", "R8C6"], ["R4C3", "R3C4"], ["R3C6", "R2C7"]];
const circles = ["R1C2", "R3C5", "R4C8", "R9C5", "R1C1", "R2C4", "R4C7", "R7C3", "R4C3", "R2C5", "R1C9", "R9C9"];
const bridgeKeys = new Set(bridges.map(b=>b.slice().sort().join(',')));
const label = (c,k)=>AND(new Given(H(c),code(k)[0]),new Given(L(c),code(k)[1]));
for(const c of cells) {
  out.push(OR(...Array.from({length:23},(_,k)=>AND(label(c,k),new Given(S(c),k===0?1:2),...(k===0?[new Given(D(c),1)]:[])))));
  // A depth-one cell is the reading-order first occurrence of its support;
  // every other cell descends within that support. Edge bounds make depths BFS distances.
  const {row:r,col}=parseCellId(c);
  const ns=[[r-1,col],[r+1,col],[r,col-1],[r,col+1]].filter(([a,b])=>a>=1&&a<=9&&b>=1&&b<=9).map(([a,b])=>makeCellId(a,b));
  const step=Pair.fnToKey((a,b)=>a===b+1,shape);
  out.push(OR(new Given(D(c),1),...ns.map(n=>AND(eq(H(c),H(n)),eq(L(c),L(n)),new Pair(step,'descend',D(c),D(n))))));
}
out.push(new ConnectedValues('VS',1));
for(let r=1;r<=9;r++) for(let c=1;c<=9;c++) {
 const a=makeCellId(r,c);
 for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
  if(r+dr>9||c+dc<1||c+dc>9) continue;
  const b=makeCellId(r+dr,c+dc);
  if(bridgeKeys.has([a,b].sort().join(','))) {
   out.push(new Given(S(a),2),new Given(S(b),2),OR(new AllDifferent(H(a),H(b)),new AllDifferent(L(a),L(b))));
  } else out.push(OR(new Given(S(a),1),new Given(S(b),1),AND(eq(H(a),H(b)),eq(L(a),L(b)))));
  if(dr+Math.abs(dc)===1) {
   const near=Pair.fnToKey((x,y)=>Math.abs(x-y)<=1,shape);
   out.push(OR(new AllDifferent(H(a),H(b)),new AllDifferent(L(a),L(b)),new Pair(near,'distance edge',D(a),D(b))));
  }
 }
 if(r<9&&c<9) out.push(new ContainAtLeast('2', S(a),S(makeCellId(r+1,c)),S(makeCellId(r,c+1)),S(makeCellId(r+1,c+1))));
}
// Each catalogue label occurs either nowhere, or in exactly one connected
// component summing to 9 and containing every digit of its named support.
for(let k=1;k<=22;k++) {
 const support=supports[k-1], [kh,kl]=code(k), full=(1<<support.length)-1;
 const spec=NFA.encodeSpec({startState:{p:0,h:0,hit:false,sum:0,mask:0,first:false}, transition:(s,v)=>{
  if(s.p===0) return {...s,p:1,h:v};
  if(s.p===1) return {...s,p:2,hit:s.h===kh&&v===kl,h:0};
  if(s.p===2) {
   if(!s.hit) return {...s,p:3};
   const i=support.indexOf(v); if(i<0||s.sum+v>9) return undefined;
   return {...s,p:3,sum:s.sum+v,mask:s.mask|(1<<i)};
  }
  if(s.hit && ((s.first && v===1)||(!s.first && v!==1))) return undefined;
  return {...s,p:0,hit:false,first:s.first||s.hit};
 },accept:s=>s.p===0&&(s.sum===0||(s.sum===9&&s.mask===full))},shape);
 out.push(new NFA(spec,'island support '+k,...cells.flatMap(c=>[H(c),L(c),c,D(c)])));
}
// Fixed-label branches preserve the circle's region identity. The state counts
// until the first different label on each ray, resetting only that blocker at a break.
for(const c of circles) {
 const {row:r,col}=parseCellId(c);
 const rays=[];
 for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
  const ray=[]; for(let a=r+dr,b=col+dc;a>=1&&a<=9&&b>=1&&b<=9;a+=dr,b+=dc) {const n=makeCellId(a,b);ray.push(H(n),L(n));}
  if(ray.length) rays.push(ray);
 }
 out.push(OR(...Array.from({length:23},(_,k)=>{
  const [kh,kl]=code(k);
  const spec=NFA.encodeSpec({startState:{target:0,count:1,p:0,h:0,blocked:false},transition:(s,v)=>{
   if(v===SEGMENT_BREAK) return {...s,p:0,h:0,blocked:false};
   if(s.target===0) return {...s,target:v};
   if(s.p===0) return {...s,p:1,h:v};
   const blocked=s.blocked||s.h!==kh||v!==kl;
   const count=s.count+(blocked?0:1); if(count>s.target) return undefined;
   return {...s,p:0,h:0,blocked,count};
  },accept:s=>s.p===0&&s.count===s.target},shape,{multiSegment:true});
  return AND(label(c,k),new NFA(spec,'region sightline',[c],...rays));
 })));
}
return [shape, hi.toVar('support high'), lo.toVar('support low'), depth.toVar('distance'), sea.toVar('ocean'), ...out];
