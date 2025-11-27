// import shajs from 'sha.js';

// export function hexStringToUint8Array(hexString) {
//     const byteArray = new Uint8Array(hexString.length / 2);
//     for (let i = 0; i < hexString.length; i += 2) {
//         byteArray[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
//     }
//     return byteArray;
// }

export function hexStringToUint32Array(hexString) {
    const byteArray = new Uint32Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        byteArray[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
    }
    return byteArray;
}

// export function uint8ArrayToHex(uint8Array) {
//     return Array.from(uint8Array)
//         .map(byte => byte.toString(16).padStart(2, '0')) // 16진수 변환 및 2자리 패딩
//         .join(''); // 문자열로 결합
// }
// export function concatUint8Array(f, s) {
//     var concated = new Uint8Array(f.length + s.length);
//     concated.set(s, 0);
//     return concated.set(f, 32);
// }
// export function reverseBuffer(buff){
//     var reversed = new Uint8Array(32);
//     for (var i = buff.length - 1; i >= 0; i--)
//         reversed[buff.length - i - 1] = buff[i];
//     return reversed;
// };
// /**
//  * 
//  * @param {*} buff : Uint8Array type
//  * @returns string, SHA256, HEX
//  */
// export function sha256dBuffer(buff){
//     var step1Hash = shajs('sha256').update(buff).digest('hex');
//     return shajs('sha256').update(hexStringToUint8Array(step1Hash)).digest('hex');
// }
// /**
//  * 
//  * @param {*} string : String type, HEX
//  * @returns string, SHA256, HEX
//  */
// export function sha256dString(string){
//     var step1Hash = shajs('sha256').update(hexStringToUint8Array(string)).digest('hex');
//     return shajs('sha256').update(hexStringToUint8Array(step1Hash)).digest('hex');
// }

export function getnTime(){
    return Math.floor(new Date().getTime()/1000).toString(16);
}