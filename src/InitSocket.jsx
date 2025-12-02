import { io } from 'socket.io-client';
import { getPeerID } from './PeerID.jsx';
import { useRef } from 'react';

function initSocket() {
    var peerId = getPeerID();
    const socketRef = useRef(null);;
    socketRef.current = io("http://117.16.244.34:8084", { query: { peerId  } });
    console.log(`Socket initialized with PeerID: ${peerId}`);
    return socketRef.current;
}

export { initSocket };