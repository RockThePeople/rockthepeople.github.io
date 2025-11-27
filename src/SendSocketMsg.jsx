import { getPeerID } from './PeerID.jsx';

export function sendSocketMsg(socket, method, params = []) {
    const peerID = getPeerID();
    try {
        console.log(`Sending socket message ${method} with params:`, params);
        const data = JSON.stringify({
            id: peerID,
            method: method,
            params: params
        });
        socket.emit('message', data);
    } catch (error) {
        console.error(`Failed to send socket message ${method}:`, error);
    }
    
}