var compilerOptions = require('./tsconfig.json');
compilerOptions.module = 'commonJS';

module.exports = function (w) {

    return {
      files: [
        'app/src/**/*.ts',
        "app/JiraLinkApp.ts"
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
