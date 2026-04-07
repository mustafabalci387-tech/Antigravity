const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  if (!fs.existsSync(dir)) return filelist || [];
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      if (file !== 'node_modules') {
        filelist = walkSync(dir + '/' + file, filelist);
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
         filelist.push(dir + '/' + file);
      }
    }
  });
  return filelist;
};

const srcFiles = walkSync(path.join(__dirname, 'src'));

const replaceMap = {
  'core/components': 'base/components',
  'core/utils': 'base/utils',
  'core/services': 'base/services',
  'core/hooks/useSocket': 'features/message/hooks/useSocket'
};

srcFiles.forEach(filepath => {
  let content = fs.readFileSync(filepath, 'utf8');
  let originalContent = content;
  
  for (const [oldPart, newPart] of Object.entries(replaceMap)) {
    const escapedOld = oldPart.replace(/\//g, '\\/');
    // match anything inside quotes that contains oldPart
    const regex = new RegExp(`(['"])([^'"]*?)${escapedOld}([^'"]*?)(['"])`, 'g');
    content = content.replace(regex, `$1$2${newPart}$3$4`);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${filepath}`);
  }
});
