const fs = require('fs');
const path = require('path');

const targetDir = './src/client';

function getRelativePath(filePath) {
  const depth = filePath.split(path.sep).length - targetDir.split(path.sep).length - 1;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  return `${prefix}context/LangContext`;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('useLang')) return;
  if (!content.includes('const ') || !content.includes('return (')) return;

  const importPath = getRelativePath(filePath);
  const importLine = `import { useLang } from '${importPath}';\n`;
  const hookLine = `\n  const { t } = useLang();`;

  // Ajouter import après le dernier import
  if (content.includes('import ')) {
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLastImport + 1) + importLine + content.slice(endOfLastImport + 1);
  }

  // Ajouter hook après ouverture du composant
  content = content.replace(
    /(const \w+ = \(.*?\) => \{)/,
    `$1${hookLine}`
  );

  fs.writeFileSync(filePath, content);
  //console.log(`✅ Mis à jour : ${filePath}`);
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
      processFile(fullPath);
    }
  });
}

walkDir(targetDir);
//console.log('\n Terminé ! Tous les fichiers ont été mis à jour.');