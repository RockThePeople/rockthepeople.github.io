import { io } from 'socket.io-client';
import { getPeerID } from './PeerID.jsx';
import { useRef } from 'react';

function initSocket() {
    const socketRef = useRef(null);
    const peerID = getPeerID();
    socketRef.current = io("https://rockthepeople.store", { query: { peerID } });
    return socketRef.current;
}

export { initSocket };