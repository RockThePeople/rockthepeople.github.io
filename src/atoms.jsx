import { atom } from 'recoil';

export const atomExtraNonce1 = atom({
    key: 'extraNonce1',
    default: ''
})

export const atomAuthFlag = atom({
    key: 'authFlag',
    default: false
})

export const atomSubscribeFlag = atom({
    key: 'subscribeFlag',
    default: false
})

export const atomJobParams = atom({
    key: 'jobParams',
    default: {}
})

export const atomDifficulty = atom({
    key: 'difficulty',
    default: ''
})