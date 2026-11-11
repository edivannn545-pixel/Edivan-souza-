// "Foto" do projeto: SHA-256 de cada arquivo de src/, tools/ e public/.
// node tools/hashes.mjs salvar <nome>      -> grava out/hashes-<nome>.json
// node tools/hashes.mjs comparar <a> <b>   -> lista os arquivos que mudaram entre as duas fotos
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
const snap = () =>
  Object.fromEntries(
    ['src', 'tools', 'public']
      .flatMap((d) => walk(path.join(root, d)))
      .map((f) => [path.relative(root, f).replace(/\\/g, '/'), crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]),
  );

const [cmd, a, b] = process.argv.slice(2);
const file = (n) => path.join(root, 'out', `hashes-${n}.json`);
if (cmd === 'salvar') {
  const s = snap();
  fs.writeFileSync(file(a), JSON.stringify(s, null, 1));
  console.log(`Foto "${a}": ${Object.keys(s).length} arquivos`);
} else {
  const A = JSON.parse(fs.readFileSync(file(a), 'utf8'));
  const B = JSON.parse(fs.readFileSync(file(b), 'utf8'));
  const all = [...new Set([...Object.keys(A), ...Object.keys(B)])].sort();
  const changed = all.filter((f) => A[f] !== B[f]);
  console.log(`Comparando "${a}" -> "${b}": ${all.length} arquivos verificados`);
  for (const f of changed) console.log(`  ALTERADO  ${f}`);
  console.log(`${changed.length} arquivo(s) alterado(s), ${all.length - changed.length} sem nenhuma mudança.`);
}
