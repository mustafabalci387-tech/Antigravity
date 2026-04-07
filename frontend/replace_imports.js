const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  if (!fs.existsSync(dir)) return filelist || [];
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
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

const directoryPath = path.join(__dirname, 'app');
const sourceFiles = walkSync(directoryPath);
const srcServices = walkSync(path.join(__dirname, 'src'));

const allFiles = [...sourceFiles, ...srcServices];

const replaceMap = {
  '@/services/authService': '@/src/features/auth/services/authService',
  '@/services/userService': '@/src/features/user/services/userService',
  '@/services/jobService': '@/src/features/job/services/jobService',
  '@/services/bidService': '@/src/features/bid/services/bidService',
  '@/services/messageService': '@/src/features/message/services/messageService',
  '@/services/notificationService': '@/src/features/notification/services/notificationService',
  '@/services/paymentService': '@/src/features/payment/services/paymentService',
  '@/services/portfolioService': '@/src/features/portfolio/services/portfolioService',
  '@/services/BaseService': '@/src/base/services/BaseService',
  '../../services/BaseService': '@/src/base/services/BaseService',
  '../services/BaseService': '@/src/base/services/BaseService',
  '../../../services/BaseService': '@/src/base/services/BaseService',
  '../../services/authService': '@/src/features/auth/services/authService',
  '../services/authService': '@/src/features/auth/services/authService',
  '../../services/messageService': '@/src/features/message/services/messageService',
  '../services/messageService': '@/src/features/message/services/messageService',
  '@/utils/toast': '@/src/base/utils/toast',
  '@/utils/dateFormatter': '@/src/base/utils/dateFormatter',
  '@/hooks/useSocket': '@/src/features/message/hooks/useSocket'
};

allFiles.forEach(filepath => {
  let content = fs.readFileSync(filepath, 'utf8');
  let originalContent = content;
  
  for (const [oldImport, newImport] of Object.entries(replaceMap)) {
    // Escape string for regex
    const escapedOldImport = oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    content = content.replace(new RegExp(`['"]${escapedOldImport}['"]`, 'g'), `'${newImport}'`);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${filepath}`);
  }
});
