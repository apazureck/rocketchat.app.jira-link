var compilerOptions = require('./tsconfig.json');
compilerOptions.module = 'commonJS';

module.exports = function (w) {

    return {
      files: [
        'src/**/*.ts',
        "JiraLinkApp.ts"
      ],

      tests: [
        'test/**/*spec.ts'
      ],

      trace: true,

      autoDetect: true,

      testFramework: {
        // the jest configuration file path
        // (relative to project root)
        configFile: './jest.config.wallaby.js'
      }
  };
};
