const { checkTarget } = require('../src/checker');
checkTarget(process.argv[2] || 'http://localhost:4000/health').then(console.log);