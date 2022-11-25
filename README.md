# AWS Amplify CLI for LocalStack

This project provides a thin wrapper script `amplifylocal` for using the [Amplify JS](https://github.com/aws-amplify/amplify-js) library against local APIs provided by [LocalStack](https://github.com/localstack/localstack).

## Quick Installation

The `amplifylocal` command line is published as an [npm library](https://www.npmjs.com/package/amplify-js-local):
```
$ npm install -g amplify-js-local @aws-amplify/cli
...
```

**Note:** The dependency `@aws-amplify/cli` needs to be installed manually (to decouple the two libraries, and allow using arbitrary versions of `@aws-amplify/cli` under the covers).

The version reported by `amplifylocal` represents the version of the underlying `@aws-amplify/cli` installation:
```
$ amplifylocal --version
4.41.0
```

## Configurations

The following environment variables can be configured:

* `EDGE_PORT`: Port under which LocalStack edge service is accessible (default: `4566`)
* `LOCALSTACK_HOSTNAME`: Target host under which LocalStack edge service is accessible (default: `localhost`)

## Deploying a Sample App via the CLI

We can use a sample app provided by AWS to run a quick test for getting started:
```
$ git clone https://github.com/aws-samples/aws-amplify-graphql
$ cd aws-amplify-graphql
$ npm install
...
$ amplifylocal init
# press [ENTER] a few times to configure the defaults ...
...
$ amplifylocal add auth
...
$ amplifylocal add api
...
$ amplifylocal push
...
```

Once the deployment is done, you can inspect the created resources via the [`awslocal`](https://github.com/localstack/awscli-local) command line:
```
$ awslocal appsync list-graphql-apis
{
    "graphqlApis": [
        {
            "name": "awsamplifygraphql-dev",
            "apiId": "1a6f1f11",
            "authenticationType": "API_KEY",
            "arn": "arn:aws:appsync:us-east-1:000000000000:apis/1a6f1f11",
            "uris": {
                "GRAPHQL": "http://localhost:4566/graphql/1a6f1f11",
                "REALTIME": "ws://localhost:4510/graphql/1a6f1f11"
            }
        },
    ...
```

## Using the Library in your Node.js Program (Backend)

In addition to using the CLI, you should also be able to use the library in your local Node.js program.

```
// import and apply patches
const amplifyLocal = require('amplify-js-local/lib/index');
amplifyLocal.applyPatches();

// use regular amplify commands below (should automatically use the local endpoints)
...
```

## Using the Library in your ES6 JavaScript Code (e.g., React Frontend)

The library can also be imported and used in your ES6 frontend code (e.g., React.js):

```
import Amplify from 'aws-amplify';
import applyPatches from 'amplify-js-local/lib/es6';

// apply patches
applyPatches();

// configure Amplify
Amplify.configure(...);
```

## Change Log

* 0.1.8: Patch AWS_AMPLIFY_ENDPOINT and add HTTPS support
* 0.1.7: Include esm lib in the dependencies
* 0.1.2: Patch AWS SDK clients (Cognito IdP/Identity) to use local endpoints
* 0.1.1: Add patching for `@aws-amplify/auth` endpoints
* 0.1.0: Initial release

## License

This code is distributed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
