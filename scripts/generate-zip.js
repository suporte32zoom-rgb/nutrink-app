import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const archiverPkg = require('archiver');

const rootDir = process.cwd();
const outputTargets = [
  path.join(rootDir, 'nutrink-app.zip'),
  path.join(rootDir, 'public', 'nutrink-app.zip')
];

// Ensure public dir exists
if (!fs.existsSync(path.join(rootDir, 'public'))) {
  fs.mkdirSync(path.join(rootDir, 'public'), { recursive: true });
}

function createZip(outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiverPkg('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => {
      console.log(`[ZIP SUCCESS] ${outputPath} created: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve(archive.pointer());
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // List of files to put directly in the root of the zip (ABSOLUTE ROOT, NO SUBFOLDER)
    const rootFiles = [
      'package.json',
      'tsconfig.json',
      'tsconfig.app.json',
      'index.html',
      'vite.config.ts',
      'server.js',
      'server.ts',
      '.htaccess',
      '.env.example',
      'HOSTINGER_DEPLOY.md',
      'metadata.json'
    ];

    rootFiles.forEach(file => {
      const fullPath = path.join(rootDir, file);
      if (fs.existsSync(fullPath)) {
        archive.file(fullPath, { name: file });
      }
    });

    // Directories to add directly at the root of the zip
    // Include src, public, and pre-compiled dist/ (ready for instant Hostinger Node.js execution without requiring build tools)
    // STRICT RULE: Exclude node_modules, .aistudio, and any zip files
    const rootDirectories = ['dist', 'src', 'public'];

    rootDirectories.forEach(dir => {
      const fullPath = path.join(rootDir, dir);
      if (fs.existsSync(fullPath)) {
        archive.directory(fullPath, dir, (entry) => {
          if (!entry.name) return entry;
          // Never include zip files, node_modules, or internal .aistudio files
          if (
            entry.name.endsWith('.zip') ||
            entry.name.includes('node_modules') ||
            entry.name.includes('.aistudio') ||
            entry.name.includes('.git')
          ) {
            return false;
          }
          return entry;
        });
      }
    });

    archive.finalize();
  });
}

async function run() {
  console.log('Generating Hostinger-compliant clean ZIP (no dist, no node_modules, root package.json)...');
  for (const target of outputTargets) {
    await createZip(target);
  }
}

run().catch(err => {
  console.error('Failed to create zip package:', err);
  process.exit(1);
});
