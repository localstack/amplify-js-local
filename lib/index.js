
// endpoint defaults
const DEFAULT_EDGE_PORT = 4566;
const DEFAULT_HOSTNAME = 'localhost.localstack.cloud';

// TODO make configurable?
const AWS_ACCESS_KEY_ID = 'test';
const AWS_SECRET_ACCESS_KEY = 'test';

//----------------
// UTIL FUNCTIONS
//----------------

const getLocalEndpoint = () => {
  const port = process.env.EDGE_PORT || DEFAULT_EDGE_PORT;
  const host = process.env.LOCALSTACK_HOSTNAME || DEFAULT_HOSTNAME;
  return process.env.LOCALSTACK_ENDPOINT || `https://${host}:${port}`;
};

const patchAwsConfig = (config) => {
  config.endpoint = getLocalEndpoint();
  config.accessKeyId = AWS_ACCESS_KEY_ID;
  config.secretAccessKey = AWS_SECRET_ACCESS_KEY;
  config.s3ForcePathStyle = true;
};

const setDefaultCredentials = () => {
  process.env.AWS_ACCESS_KEY_ID = AWS_ACCESS_KEY_ID;
  process.env.AWS_SECRET_ACCESS_KEY = AWS_SECRET_ACCESS_KEY;
};

const patchEnvVariables = () =>{
  process.env.AWS_AMPLIFY_ENDPOINT = getLocalEndpoint()
}

//---------
// PATCHES
//---------

const patchCognitoEndpoint = () => {
  try {
    // TODO - is this required?
    const amplifyAuth = require('@aws-amplify/auth');
    amplifyAuth.aws_cognito_endpoint = getLocalEndpoint();
  } catch (e) {}
};

const patchSysConfigManagerPath = () => {
  // patch system config manager to use local endpoints
  try {
    const sysConfigManagerPath = 'amplify-provider-awscloudformation/lib/system-config-manager';
    let sysConfigManager = null;
    try {
      sysConfigManager = require(sysConfigManagerPath);
    } catch (e) {
      sysConfigManager = require(`@aws-amplify/cli/node_modules/${sysConfigManagerPath}`);
    }
    const getProfiledAwsConfigOrig = sysConfigManager.getProfiledAwsConfig;
    sysConfigManager.getProfiledAwsConfig = async (context, profileName, isRoleSourceProfile) => {
      const result = await getProfiledAwsConfigOrig(context, profileName, isRoleSourceProfile);
      patchAwsConfig(result);
      return result;
    };
  } catch (e) {}
};

const patchConfigManagerPath = () => {
  // patch config manager to use local endpoints
  try {
    const configManagerPath = 'amplify-provider-awscloudformation/lib/configuration-manager';
    let configManager = null;
    try {
      configManager = require(configManagerPath);
    } catch (e) {
      configManager = require(`@aws-amplify/cli/node_modules/${configManagerPath}`);
    }
    const getAwsConfigOrig = configManager.getAwsConfig;
    configManager.getAwsConfig = async (context) => {
      const result = await getAwsConfigOrig(context);
      patchAwsConfig(result);
      return result;
    };
    const loadConfigurationOrig = configManager.loadConfiguration;
    configManager.loadConfiguration = async (context) => {
      const result = await loadConfigurationOrig(context);
      patchAwsConfig(result);
      return result;
    };
  } catch (e) {}
};

const patchAwsSdkEndpoints = (AWS) => {
  // patch AWS SDK clients to use local endpoints
  const _patch = () => {
    const createClientsOrig = AWS.CognitoIdentityCredentials.prototype.createClients;
    AWS.CognitoIdentityCredentials.prototype.createClients = function() {
      this._clientConfig.endpoint = getLocalEndpoint();
      return createClientsOrig.bind(this)();
    };
  };
  try {
    _patch();
  } catch (e) { }
};

const patchAmplifyAuthEndpoint = (authInstance) => {
  // patch amplify Auth class to use local endpoints
  const _patch = (inst) => {
    const createCognitoUserOrig = inst.createCognitoUser;
    inst.createCognitoUser = (username) => {
      const result = createCognitoUserOrig.bind(inst)(username);
      result.client.endpoint = getLocalEndpoint();
      return result;
    };
    const configureOrig = inst.configure;
    inst.configure = (config) => {
      if ((inst.userPool || {}).client) inst.userPool.client.endpoint = getLocalEndpoint();
      const result = configureOrig.bind(inst)(config);
      if (result.client) result.client.endpoint = getLocalEndpoint();
      return result;
    };
  };
  try {
    authInstance = authInstance || require('@aws-amplify/auth');
    _patch(authInstance);
  } catch (e) { }
};

const applyPatches = () => {
  // patch credentials
  setDefaultCredentials();

  // patch env variables
  patchEnvVariables();

  // patch configs
  patchAmplifyAuthEndpoint();
  patchCognitoEndpoint();
  patchConfigManagerPath();
  patchSysConfigManagerPath();
};

const _exports = { applyPatches, getLocalEndpoint, patchAmplifyAuthEndpoint, patchAwsSdkEndpoints };

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = _exports;
  }
  exports = _exports;
}
