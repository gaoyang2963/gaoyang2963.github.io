const fs = require('fs');
const path = require('path');

function deleteDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log('Deleted: ' + dirPath);
  }
}

deleteDir('J:/WorkBuddy/20260330194813/hugo-site/content/publication');
deleteDir('J:/WorkBuddy/20260330194813/hugo-site/content/member');
deleteDir('J:/WorkBuddy/20260330194813/hugo-site/content/news');
deleteDir('J:/WorkBuddy/20260330194813/hugo-site/content/research');

console.log('Done');
