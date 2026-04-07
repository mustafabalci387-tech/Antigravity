const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  if (!fs.existsSync(dir)) return filelist || [];
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      if (file !== '__pycache__') {
        filelist = walkSync(dir + '/' + file, filelist);
      }
    } else {
      if (file.endsWith('.py')) {
         filelist.push(dir + '/' + file);
      }
    }
  });
  return filelist;
};

const appDir = path.join(__dirname, 'app');
const srcFiles = walkSync(appDir);

const replaceMap = {
    'from app.base.model import': 'from app.base.BaseModel import',
    'import app.base.model': 'import app.base.BaseModel',
    'from app.base.repository import': 'from app.base.BaseRepo import',
    'import app.base.repository': 'import app.base.BaseRepo',
    'from app.base.manager import': 'from app.base.BaseManager import',
    'import app.base.manager': 'import app.base.BaseManager',
    'from app.base.service import': 'from app.base.BaseService import',
    'import app.base.service': 'import app.base.BaseService',
    'from app.core.services.cloudinary_service import': 'from app.features.shared.services.cloudinary_service import',
    'import app.core.services.cloudinary_service': 'import app.features.shared.services.cloudinary_service'
};

srcFiles.forEach(filepath => {
  let content = fs.readFileSync(filepath, 'utf8');
  let originalContent = content;
  
  for (const [oldImport, newImport] of Object.entries(replaceMap)) {
    content = content.split(oldImport).join(newImport);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${filepath}`);
  }
});
