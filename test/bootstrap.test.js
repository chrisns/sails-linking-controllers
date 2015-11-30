global.chai = require('chai')
  .use(require('sinon-chai'))
global.expect = global.chai.expect;
global.sinon = require('sinon');
global.rewire = require('rewire');
