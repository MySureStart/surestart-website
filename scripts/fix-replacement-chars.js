/**
 * One-off fix: replace U+FFFD (�) replacement characters with the correct
 * punctuation based on context. Run: `node scripts/fix-replacement-chars.js`.
 */
const fs = require('fs');
const path = require('path');

const R = '\uFFFD';      // � replacement char
const EM = '\u2014';     // —
const EN = '\u2013';     // –
const BULL = '\u2022';   // •
const ELL = '\u2026';    // …
const LDQ = '\u201C';    // "
const RDQ = '\u201D';    // "

/** Each entry: [relative file path, [ [search, replacement], ... ] ] */
const edits = [
  ['index.html', [
    [`60-minute blocks</span> ${R}`, `60-minute blocks</span> ${BULL}`],
    [`UN Sustainable Development Goals ${R} projects`, `UN Sustainable Development Goals ${EM} projects`],
    [`UN SDG: 4 ${R} Quality Education`, `UN SDG: 4 ${EN} Quality Education`],
    [`Empowering neurodiverse students ${R} AI`, `Empowering neurodiverse students ${EM} AI`],
    [`UN SDG: 3 ${R} Good Health`, `UN SDG: 3 ${EN} Good Health`],
    [`Compassionate recovery ${R} AI`, `Compassionate recovery ${EM} AI`],
    [`UN SDG: 2 ${R} Zero Hunger`, `UN SDG: 2 ${EN} Zero Hunger`],
    [`Less waste. More meals ${R} AI`, `Less waste. More meals ${EM} AI`],
    // Footer separators (two occurrences) handled by global span replacement below
  ]],
  ['k12/index.html', [
    [`AI ${R} shaping how our students learn`, `AI ${EM} shaping how our students learn`],
    [`teach AI ${R} regardless of prior technical experience`, `teach AI ${EM} regardless of prior technical experience`],
    [`years of python ${R} our courses meet students`, `years of python ${EM} our courses meet students`],
    [`60-minute blocks</span> ${R}`, `60-minute blocks</span> ${BULL}`],
    [`existing offerings ${R} whether as an elective, after-school program, or summer course ${R} without requiring`, `existing offerings ${EM} whether as an elective, after-school program, or summer course ${EM} without requiring`],
    [`with purpose ${R} ensuring they are not just keeping pace`, `with purpose ${EM} ensuring they are not just keeping pace`],
    [`Virtual ${R} Annual Program`, `Virtual ${BULL} Annual Program`],
    // Coming soon… (two occurrences) and K–12 (many) handled below
  ]],
  ['impact-stories/index.html', [
    [`young student ${R} it truly changed my life`, `young student ${EM} it truly changed my life`],
    [`MIT FutureMakers program through SureStart ${R} an experience`, `MIT FutureMakers program through SureStart ${EM} an experience`],
    [`network to thrive ${R} and now, as a mentor`, `network to thrive ${EM} and now, as a mentor`],
    [`tangible change ${R} it truly transformed`, `tangible change ${EM} it truly transformed`],
    [`reach a doctor ${R} now a funded startup`, `reach a doctor ${EM} now a funded startup`],
    [`new journey. ${R}There are so many resources`, `new journey. ${LDQ}There are so many resources`],
    [`show you the way.${R}`, `show you the way.${RDQ}`],
  ]],
];

function fixFile(rel, list) {
  const p = path.join(__dirname, '..', rel);
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  for (const [find, repl] of list) {
    if (!s.includes(find)) {
      console.warn(`  [skip] not found in ${rel}: ${JSON.stringify(find).slice(0, 80)}…`);
      continue;
    }
    s = s.split(find).join(repl);
  }

  // Global rules applied to every file
  // 1) footer separator <span>�</span> → <span>•</span>
  s = s.split(`<span>${R}</span>`).join(`<span>${BULL}</span>`);
  // 2) "K�12" → "K–12" (en dash)
  s = s.split(`K${R}12`).join(`K${EN}12`);
  // 3) "Coming soon�" → "Coming soon…"
  s = s.split(`Coming soon${R}`).join(`Coming soon${ELL}`);

  if (s === before) {
    console.log(`= unchanged: ${rel}`);
  } else {
    fs.writeFileSync(p, s, 'utf8');
    const remaining = (s.match(/\uFFFD/g) || []).length;
    console.log(`✓ fixed ${rel} (remaining � = ${remaining})`);
  }
}

for (const [rel, list] of edits) fixFile(rel, list);

console.log('\nDone.');
