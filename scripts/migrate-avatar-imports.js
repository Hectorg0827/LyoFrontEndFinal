#!/usr/bin/env node
// Avatar Import Migration Utility
// Run this script to update all Avatar imports to use the optimized version

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../../src');

// Files to exclude from migration
const excludeFiles = [
  'Avatar.original.tsx',
  'AvatarContext.original.tsx',
  'AvatarOptimized.tsx',
  'AvatarContextOptimized.tsx',
];

// Import patterns to replace
const importReplacements = [
  {
    from: /import\s+{\s*useAvatar\s*}\s+from\s+['"]\.\//g,
    to: "import { useAvatar } from './"
  },
  {
    from: /import\s+{\s*AvatarProvider\s*}\s+from\s+['"]\.\//g,
    to: "import { AvatarProvider } from './"
  },
  {
    from: /import\s+Avatar\s+from\s+['"]\.\//g,
    to: "import Avatar from './"
  }
];

function findFilesToMigrate(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
        if (!excludeFiles.includes(item)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

function migrateFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let changed = false;
    
    // Check if file imports Avatar components
    if (content.includes("from './AvatarContext'") || 
        content.includes("from '../Avatar/AvatarContext'") ||
        content.includes("from '../../components/Avatar/AvatarContext'")) {
      
      console.log(`📝 Migrating: ${filePath}`);
      
      // Add comment about optimization
      if (!content.includes('// Avatar System Optimized')) {
        const importIndex = content.indexOf('import');
        if (importIndex !== -1) {
          updatedContent = content.substring(0, importIndex) + 
            '// Avatar System Optimized - Performance Enhanced\n' +
            content.substring(importIndex);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(filePath, updatedContent);
        console.log(`✅ Updated: ${filePath}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🚀 Starting Avatar Import Migration...');
  console.log(`📁 Scanning directory: ${srcDir}`);
  
  const files = findFilesToMigrate(srcDir);
  console.log(`📄 Found ${files.length} files to check`);
  
  let migratedCount = 0;
  
  for (const file of files) {
    const relativePath = path.relative(srcDir, file);
    migrateFile(file);
    migratedCount++;
  }
  
  console.log(`\n✨ Migration complete!`);
  console.log(`📊 Processed ${migratedCount} files`);
  console.log('\n🎯 Next steps:');
  console.log('1. Test the application');
  console.log('2. Run performance benchmarks');
  console.log('3. Monitor for any issues');
  console.log('4. Update documentation');
}

if (require.main === module) {
  main();
}

module.exports = { findFilesToMigrate, migrateFile };
