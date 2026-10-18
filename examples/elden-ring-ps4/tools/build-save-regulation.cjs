// Local candidate only; never writes to the PS4 or overwrites the source save.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const dir = path.dirname(path.resolve(process.argv[4] || '.'));
const project = __dirname;
assert.equal(process.argv.length, 7, 'Usage: node build-save-regulation.cjs SAVE MOD OUTPUT SAVE_SHA256 MOD_SHA256');
const originalPath = path.resolve(process.argv[2]);
const modPath = path.resolve(process.argv[3]);
const expectedOriginal = process.argv[5].toLowerCase();
const expectedMod = process.argv[6].toLowerCase();
assert(/^[a-f0-9]{64}$/.test(expectedOriginal) && /^[a-f0-9]{64}$/.test(expectedMod), 'Invalid hashes');
assert(!fs.existsSync(path.resolve(process.argv[4])), 'Output exists');
assert(!fs.existsSync(path.join(dir, 'swap-verification.json')), 'Report exists');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const key = Buffer.from('99bffc366a6bc8c6f5827d093602d676c42892a01c207fb024d3af4e493fef99', 'hex');
const slotStart = 0x70, slotSize = 0x280000, profileSize = 0x60000;
const profileStart = slotStart + 10 * slotSize;
const sectionStart = profileStart + profileSize;
const payloadStart = sectionStart + 16;

// Reuse the project's bounded DCX/BND4 readers, without running its batch job.
const context = {require, Buffer, __dirname: path.join(project, 'analysis-26.0')};
vm.createContext(context);
const inspector = fs.readFileSync(path.join(project, 'analysis-26.0/analyze-mod.cjs'), 'utf8');
assert(inspector.includes('const inputs='));
vm.runInContext(inspector.split('const inputs=')[0] + ';globalThis.api={unwrap,binder};', context);

function decrypt(bytes) {
  assert(bytes.length >= 32 && bytes.length % 16 === 0, 'Invalid AES allocation');
  const cipher = crypto.createDecipheriv('aes-256-cbc', key, bytes.subarray(0, 16));
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(bytes.subarray(16)), cipher.final()]);
}

function encrypt(plain, iv) {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  cipher.setAutoPadding(false);
  return Buffer.concat([iv, cipher.update(plain), cipher.final()]);
}

function inspect(bytes) {
  const plain = decrypt(bytes);
  assert.equal(plain.toString('ascii', 0, 4), 'DCX\0');
  const bnd = context.api.unwrap(plain).bytes;
  assert.equal(bnd.toString('ascii', 0, 4), 'BND4');
  const version = bnd.toString('ascii', 24, 32);
  assert(/^\d{8}$/.test(version), 'Unexpected binder version');
  const files = context.api.binder(bnd).files;
  assert(files.every(f => f.decoded && !f.error), 'Undecodable binder member');
  return {plain, bnd, version: Number(version), files};
}

function makeCandidate(original, mod) {
  assert.equal(original.length, 28967040, 'Unexpected save size');
  assert.equal(original.readUInt32LE(0), 0x2c9c01cb, 'Not a raw PS4 save');
  assert.equal(original.toString('ascii', sectionStart, sectionStart + 4), ' GER');
  assert.equal(original.readUInt32LE(sectionStart + 4), 2, 'Unexpected regulation header');
  const capacity = original.readUInt32LE(sectionStart + 12);
  assert.equal(payloadStart + capacity, original.length, 'Allocation exceeds save bounds');
  assert(mod.length <= capacity, 'Clever regulation does not fit');
  const old = inspect(original.subarray(payloadStart));
  const replacement = inspect(mod);
  assert.equal(original.readUInt32LE(sectionStart + 8), old.version, 'Header/binder version mismatch');
  assert(encrypt(old.plain, original.subarray(payloadStart, payloadStart + 16))
    .equals(original.subarray(payloadStart)), 'Original AES roundtrip failed');
  const padded = Buffer.alloc(capacity - 16);
  replacement.plain.copy(padded);
  const blob = encrypt(padded, mod.subarray(0, 16));
  assert(blob.subarray(0, mod.length).equals(mod), 'Original Clever ciphertext changed');
  const candidate = Buffer.from(original);
  blob.copy(candidate, payloadStart);
  candidate.writeUInt32LE(replacement.version, sectionStart + 8);
  return {candidate, old, replacement, capacity};
}

const original = fs.readFileSync(originalPath);
const mod = fs.readFileSync(modPath);
assert.equal(sha(original), expectedOriginal, 'Source save identity changed');
assert.equal(sha(mod), expectedMod, 'Source mod identity changed');
const {candidate, old, replacement, capacity} = makeCandidate(original, mod);

// Fail-closed checks for damaged inputs and a mod larger than the reserved space.
const badMagic = Buffer.from(original); badMagic[0] ^= 1;
assert.throws(() => makeCandidate(badMagic, mod), /raw PS4/);
const badCapacity = Buffer.from(original); badCapacity.writeUInt32LE(capacity + 16, sectionStart + 12);
assert.throws(() => makeCandidate(badCapacity, mod), /bounds/);
assert.throws(() => makeCandidate(original, Buffer.alloc(capacity + 16)), /does not fit/);
const badMod = Buffer.from(mod); badMod[16] ^= 1;
assert.throws(() => makeCandidate(original, badMod), /DCX/);

const outputDir = dir;
fs.mkdirSync(outputDir, {recursive: true});
const outputPath = path.resolve(process.argv[4]);
assert(!fs.existsSync(outputPath), 'Candidate already exists; do not overwrite');
fs.writeFileSync(outputPath, candidate, {flag: 'wx'});
const reread = fs.readFileSync(outputPath);
assert(reread.equals(candidate));
assert(reread.subarray(0, sectionStart).equals(original.subarray(0, sectionStart)),
  'Character or profile data changed');
assert(reread.subarray(sectionStart, sectionStart + 8).equals(original.subarray(sectionStart, sectionStart + 8)));
assert(reread.subarray(sectionStart + 12, payloadStart).equals(original.subarray(sectionStart + 12, payloadStart)));
const checked = inspect(reread.subarray(payloadStart));
assert(checked.bnd.equals(replacement.bnd), 'Replacement BND4 differs');
assert.equal(reread.readUInt32LE(sectionStart + 8), checked.version);
assert.equal(sha(fs.readFileSync(originalPath)), expectedOriginal, 'Original changed');
const slots = Array.from({length: 10}, (_, index) => {
  const start = slotStart + index * slotSize;
  const before = original.subarray(start, start + slotSize);
  const after = reread.subarray(start, start + slotSize);
  assert(before.equals(after));
  return {index, saveVersion: before.readUInt32LE(0), unchanged: true, sha256: sha(after)};
});
let firstDifference = -1, lastDifference = -1, changedBytes = 0;
for (let i = 0; i < original.length; i++) if (original[i] !== reread[i]) {
  if (firstDifference < 0) firstDifference = i;
  lastDifference = i;
  changedBytes++;
  assert(i >= payloadStart || (i >= sectionStart + 8 && i < sectionStart + 12));
}
const report = {
  status: 'local-candidate-verified-not-tested-in-game',
  original: {path: originalPath, bytes: original.length, sha256: expectedOriginal},
  mod: {path: modPath, bytes: mod.length, sha256: expectedMod},
  output: {path: outputPath, bytes: reread.length, sha256: sha(reread)},
  regulation: {sectionStart, payloadStart, capacity, oldVersion: old.version,
    newVersion: checked.version, oldBndSha256: sha(old.bnd), newBndSha256: sha(checked.bnd),
    oldTableCount: old.files.length, newTableCount: checked.files.length,
    cleverCiphertextPrefixUnchanged: true, cleverBndIdenticalAfterReload: true},
  differences: {firstDifference, lastDifference, changedBytes,
    allowed: 'UserData11 version field and encrypted regulation allocation only'},
  slots, profile: {unchanged: true, sha256: sha(reread.subarray(profileStart, sectionStart))},
  limitations: ['No console write performed', 'Game acceptance and persistence not tested',
    'Selection of regulation by the game remains a runtime hypothesis',
    'All ten character slots, including their existing differing save versions, preserved exactly'],
  references: ['https://github.com/ClayAmore/ER-Save-Editor/blob/master/src/save/common/user_data_11.rs',
    'https://github.com/oisis/EldenRing-SaveForge/blob/ee1042d7a5bd933f91e6f8a0162e0e0237a1c4c5/backend/core/regulation.go']
};
fs.writeFileSync(path.join(dir, 'swap-verification.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
