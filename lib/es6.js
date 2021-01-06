import amplifyAuth from '@aws-amplify/auth';
import { patchAmplifyAuthEndpoint } from './';

const applyPatches = () => {
  patchAmplifyAuthEndpoint(amplifyAuth);
};

export default applyPatches;
