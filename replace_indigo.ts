import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (filePath: string) => void) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceIndigoWithBlue(filePath: string) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('indigo')) {
      const newContent = content.replace(/indigo/g, 'blue');
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
}

walk('./src', (filePath) => {
  replaceIndigoWithBlue(filePath);
});
