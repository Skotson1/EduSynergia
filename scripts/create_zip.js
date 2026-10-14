import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const zip = new JSZip();
const ROOT_DIR = process.cwd();

function addFilesRecursively(folderPath, zipFolder, ignoreNames = []) {
  if (!fs.existsSync(folderPath)) return;
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });

  for (const entry of entries) {
    if (ignoreNames.includes(entry.name)) continue;
    const fullPath = path.join(folderPath, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.aistudio') {
        continue;
      }
      const subZip = zipFolder.folder(entry.name);
      addFilesRecursively(fullPath, subZip, ignoreNames);
    } else if (entry.isFile()) {
      // Don't include existing zip into zip
      if (entry.name.endsWith('.zip')) continue;
      const content = fs.readFileSync(fullPath);
      zipFolder.file(entry.name, content);
    }
  }
}

console.log('Pakowanie kodu źródłowego i plików projektu...');

// 1. Root files
const rootFiles = [
  'index.html',
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'metadata.json',
  'DEPLOYMENT.md',
  '.env.example',
  '.gitignore'
];

for (const f of rootFiles) {
  const p = path.join(ROOT_DIR, f);
  if (fs.existsSync(p)) {
    zip.file(f, fs.readFileSync(p));
  }
}

// 2. Add src/
const srcZip = zip.folder('src');
addFilesRecursively(path.join(ROOT_DIR, 'src'), srcZip);

// 3. Add public/
const publicZip = zip.folder('public');
addFilesRecursively(path.join(ROOT_DIR, 'public'), publicZip);

// 4. Add pre-built dist/ folder so user can use immediately without npm
if (fs.existsSync(path.join(ROOT_DIR, 'dist'))) {
  const distZip = zip.folder('dist');
  addFilesRecursively(path.join(ROOT_DIR, 'dist'), distZip);
}

// 5. Add helpful README.txt
const readmeTxt = `=====================================================
  DZIENNIK SZKOLNY EDUSYNERGIA - PACZKA PROJEKTOWA
=====================================================

Dziękujemy za pobranie! W tym archiwum znajduje się kompletny projekt:

1. FOLDER /src/
   - Pełny kod źródłowy React 19 + TypeScript + Tailwind CSS
   - Gotowy panel dyrekcji, oceny, frekwencja, zachowanie, plan lekcji, wiadomości

2. FOLDER /dist/
   - Gotowa, zminifikowana wersja produkcyjna!
   - Możesz ten folder od razu wrzucić na dowolny darmowy hosting (np. Netlify przeciągnij i upuść na netlify.com)
     i strona od razu działa w internecie!

3. JAK URUCHOMIĆ W TRYBIE DEWELOPERSKIM (jeśli masz zainstalowany Node.js):
   krok 1: Otwórz terminal w tym folderze
   krok 2: Wpisz: npm install
   krok 3: Wpisz: npm run dev
   krok 4: Otwórz w przeglądarce: http://localhost:3000

4. Szczegółową instrukcję wrzucenia do sieci znajdziesz w pliku DEPLOYMENT.md!
=====================================================
`;
zip.file('INSTRUKCJA_URUCHOMIENIA.txt', readmeTxt);

// Ensure public directory exists
const publicDir = path.join(ROOT_DIR, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const outputPath = path.join(publicDir, 'edusynergia-projekt.zip');
console.log('Generowanie pliku ZIP...');

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } })
  .then((buffer) => {
    fs.writeFileSync(outputPath, buffer);
    const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
    console.log(`Sukces! Utworzono: ${outputPath} (${sizeMb} MB)`);

    // Also copy to dist if dist exists so preview serves it immediately
    const distDir = path.join(ROOT_DIR, 'dist');
    if (fs.existsSync(distDir)) {
      fs.copyFileSync(outputPath, path.join(distDir, 'edusynergia-projekt.zip'));
      console.log('Skopiowano także do dist/edusynergia-projekt.zip');
    }
  })
  .catch((err) => {
    console.error('Błąd podczas generowania zip:', err);
    process.exit(1);
  });
