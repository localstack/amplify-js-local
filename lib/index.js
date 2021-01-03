
// endpoint defaults
const DEFAULT_EDGE_PORT = 4566;
const DEFAULT_HOSTNAME = 'localhost';

// TODO make configurable?
const AWS_ACCESS_KEY_ID = 'test';
const AWS_SECRET_ACCESS_KEY = 'test';

//----------------
// UTIL FUNCTIONS
//----------------

const getLocalEndpoint = () => {
  const port = process.env.EDGE_PORT || DEFAULT_EDGE_PORT;
  const host = process.env.LOCALSTACK_HOSTNAME || DEFAULT_HOSTNAME;
  return `http://${host}:${port}`;
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

//---------
// PATCHES
//---------

const applyPatches = () => {
  // patch environment
  setDefaultCredentials();

  const configManagerPath = 'amplify-provider-awscloudformation/lib/configuration-manager';
  const sysConfigManagerPath = 'amplify-provider-awscloudformation/lib/system-config-manager';

  // patch system config manager to use local endpoints
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

  // patch config manager to use local endpoints
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
};

module.exports.applyPatches = applyPatches;
