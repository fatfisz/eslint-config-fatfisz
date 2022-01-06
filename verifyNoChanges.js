'use strict';

const simpleGit = require('simple-git');

const git = simpleGit();

git.status().then((status) => {
  if (status.files.length) {
    git.diff().then((diff) => {
      console.error('Changes detected:');
      for (const { path, working_dir: workingDir } of status.files) {
        console.error(`  ${workingDir} ${path}`);
      }
      console.error(diff);
      process.exit(1);
    });
  }
});
