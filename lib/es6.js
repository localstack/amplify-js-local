import AWS from 'aws-sdk';
import amplifyAuth from '@aws-amplify/auth';
import { patchAmplifyAuthEndpoint, patchAwsSdkEndpoints } from './';

const applyPatches = () => {
  patchAmplifyAuthEndpoint(amplifyAuth);
  patchAwsSdkEndpoints(AWS);
};

export default applyPatches;
