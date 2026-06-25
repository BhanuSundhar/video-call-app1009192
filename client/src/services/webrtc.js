

export const configuration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:global.relay.metered.ca:80",
      username: "f83791c53577f70c19ed3818",
      credential: "lk7HgXLJPfzjrHGO",
    },
    {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: "f83791c53577f70c19ed3818",
      credential: "lk7HgXLJPfzjrHGO",
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "f83791c53577f70c19ed3818",
      credential: "lk7HgXLJPfzjrHGO",
    },
    {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: "f83791c53577f70c19ed3818",
      credential: "lk7HgXLJPfzjrHGO",
    },
  ],
};

export const createPeerConnection = () => {
  return new RTCPeerConnection(configuration);
};

