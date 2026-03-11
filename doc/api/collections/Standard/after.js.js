//export const after = () => {
  const sessionToken = res.getBody()?.data?.sessionToken;

if (sessionToken) {
  bru.setEnvVar("session_token", sessionToken);
}
//}
//after();