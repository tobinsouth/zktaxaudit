import { buildPoseidon } from "circomlibjs";
import { Ascii, MAX_JSON_LENGTH, padJSONString } from "./json";

const buildEddsa = require("circomlibjs").buildEddsa;
const buildBabyjub = require("circomlibjs").buildBabyjub;
const buildPedersenHash = require("circomlibjs").buildPedersenHash;

let eddsa;
let babyJub;
let pedersenHash;

function buffer2bits(buff: any) {
    const res = [];
    for (let i = 0; i < buff.length; i++) {
        for (let j = 0; j < 8; j++) {
            if ((buff[i] >> j) & 1) {
                res.push(BigInt(1));
            } else {
                res.push(BigInt(0));
            }
        }
    }
    return res;
}

export function uint8toBigIntStr(uint8: Uint8Array): string {
    const bigIntHash = BigInt('0x' + [...uint8].map(x => x.toString(16).padStart(2, '0')).join(''));
    const base10String = bigIntHash.toString(10);
    return base10String;
}

// export async function calculatePoseidon(json: Ascii[]): Promise<string> {
//     const poseidon = await buildPoseidon();

//     let poseidonRes = poseidon(json.slice(0, 16));
//     let i = 16;
//     while (i < json.length) {
//         poseidonRes = poseidon([poseidonRes].concat(json.slice(i, i + 15)));
//         i += 15;
//     }
//     return poseidon.F.toObject(poseidonRes).toString();
// }

const convertDictToBuffer = (dict: Record<string, number>): Uint8Array => {
    const arr = [];
    for (let i = 0; i < Object.keys(dict).length; i++) {
        arr.push(dict[`${i}`]);
    }
    return new Uint8Array(arr);
};

export const extractPartsFromSignature = (pSignature: Uint8Array, servicePubkey: Uint8Array) => {
    const r8Bits = buffer2bits(pSignature.slice(0, 32));
    const sBits = buffer2bits(pSignature.slice(32, 64));
    const aBits = buffer2bits(servicePubkey);

    return {
        servicePubkey: aBits.map((el) => el.toString()),
        R8: r8Bits.map((el) => el.toString()),
        S: sBits.map((el) => el.toString()),
    };
};

//extracts the signature and the json from a trusted API that signs requests
export const extractSignatureInputs = (input: string): ExtractedJSONSignature => {
    // expected keys:
    const expectedKeys = ["signature","servicePubkey", "json"];
    const jsonSignature = JSON.parse(input);
    // TODO: add in better error handling
    for (var i = 0; i < expectedKeys.length; i++) {
        if (!(expectedKeys[i] in jsonSignature)) {
            console.log('missing key from JSON:', expectedKeys[i]);
        }
    }
    // can these just be ASCII strings rather than JSON objects?
    const packedSignature = convertDictToBuffer(jsonSignature.signature);
    const servicePubkey = convertDictToBuffer(jsonSignature.servicePubkey);
    const jsonString = JSON.stringify(jsonSignature.json);
    const jsonUint8 = new TextEncoder().encode(jsonString)

    return { packedSignature, servicePubkey, jsonOriginal: jsonSignature.json, jsonString: jsonString, jsonUint8: jsonUint8 };
};

export const calculatePedersen = async (msg: Uint8Array): Promise<BigInt> => {
    // We change this to use a Uint8Array instead of a string and output just a number. Type changes can be handle in prove.tsx
    const pedersenHash = await buildPedersenHash();
    const hash = pedersenHash.hash(msg);
    return hash;
}


export const generateEddsaSignature = async (privateKey: Uint8Array, msg: Uint8Array) => {
    // TODO: I would love to understand more how this actually works with Pedersen
    eddsa = await buildEddsa();
    babyJub = await buildBabyjub();
    pedersenHash = await buildPedersenHash();

    const pubKey = eddsa.prv2pub(privateKey);

    const pPubKey = babyJub.packPoint(pubKey);

    const signature = eddsa.signPedersen(privateKey, msg);

    const hash = pedersenHash.hash(msg);

    const pSignature = eddsa.packSignature(signature);

    return {pSignature, msg, pPubKey, hash};
};

export const strHashToBuffer = (hash: string) => {
    let hashValue = BigInt(hash);
    let hashArr = [];
    for (let i = 0; i < 32; i++) {
        hashArr.push(Number(hashValue % BigInt(256)));
        hashValue = hashValue / BigInt(256);
    }
    return Uint8Array.from(hashArr);
};
