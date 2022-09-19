import ReactDOM from "react-dom";
import { Amplify } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import '@aws-amplify/ui-react/styles.css';

const settings = {
  // ...
  Auth: {
    endpoint: 'http://cognito-idp.localhost.localstack.cloud:4566',
    region: 'us-east-1',
    manditorySignin: true,
    userPoolId: '...',
    userPoolWebClientId: '...',
    identityPoolId: '...',
  }
}
Amplify.configure(settings);

function App() {
  return <>Success</>;
}

const AppWithAuth = withAuthenticator(App);

const rootElement = document.getElementById("root");
ReactDOM.render(<AppWithAuth />, rootElement);
