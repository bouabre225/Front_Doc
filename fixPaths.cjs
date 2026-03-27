const fs = require('fs');
const path = require('path');

const targetDir = './src/client';

function getCorrectPath(filePath) {
  const relativeToCLient = path.relative(targetDir, filePath);
  const depth = relativeToCLient.split(path.sep).length - 1;
  const prefix = '../'.repeat(depth);
  return `${prefix}context/LangContext`;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('useLang')) return;

  const correctPath = getCorrectPath(filePath);
  
  // Remplacer n'importe quel chemin vers LangContext par le bon
  content = content.replace(
    /from ['"].*context\/LangContext['"]/,
    `from '${correctPath}'`
  );

  fs.writeFileSync(filePath, content);
  //console.log(`✅ Corrigé : ${filePath} → ${correctPath}`);
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
      fixFile(fullPath);
    }
  });
}

walkDir(targetDir);
//console.log('\n🎉 Tous les chemins sont corrigés !');