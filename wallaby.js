module.exports = wallaby => ({
  files: [
    'src/**/*.js'
  ],

  tests: [
    'tests/**/*.js'
  ],
  env: {
    type: 'node'
  },
  compilers: {
    '**/*.js': wallaby.compilers.babel({ babelrc: true })
  },
  setup: () => {
    const chai = require('chai');
    chai.use(require('chai-as-promised'));
  }
});
