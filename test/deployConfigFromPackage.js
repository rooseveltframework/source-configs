/* eslint-env mocha */
const assert = require('assert')
const path = require('path')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const mockPackage = require('./mockPackage.json')
const mockPackageHome = require('./mockPackageHome.json')
const expectedConfig = require('./config.json')
const projectRoot = require('app-root-path')

describe('getConfigFromPackage', function () {
  it('should grab a deploy file from package', function (done) {
    const key = path.join(projectRoot.path, 'package.json')

    const config = proxyquire('../getDeployConfig', { [key]: { deployConfig: mockPackage.deployConfig } })()

    assert.deepStrictEqual(config, expectedConfig)

    done()
  })

  it('should grab a deploy file from package with home directory', function (done) {
    const fsStub = sinon.stub().returns(JSON.stringify(expectedConfig))

    const key = path.join(projectRoot.path, 'package.json')

    const config = proxyquire('../getDeployConfig', {
      [key]: { deployConfig: mockPackageHome.deployConfig },
      fs: {
        readFileSync: fsStub
      }
    })()

    assert.deepStrictEqual(config, expectedConfig)

    done()
  })
})
