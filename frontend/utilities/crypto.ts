import { buildPoseidon } from "circomlibjs";
import { Ascii, MAX_JSON_LENGTH, padJSONString } from "./json";

const buildEddsa = require("circomlibjs").buildEddsa;
const buildBabyjub = require("circomlibjs").buildBabyjub;
const buildPedersenHash = require("circomlibjs").buildPedersenHash;

let eddsa;
let babyJub;

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

export async function calculatePoseidon(json: Ascii[]): Promise<string> {
    const poseidon = await buildPoseidon();

    let poseidonRes = poseidon(json.slice(0, 16));
    let i = 16;
    while (i < json.length) {
        poseidonRes = poseidon([poseidonRes].concat(json.slice(i, i + 15)));
        i += 15;
    }
    return poseidon.F.toObject(poseidonRes).toString();
}

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
    const newFormattedJSON = JSON.stringify(jsonSignature.json);;
    return { packedSignature, servicePubkey, jsonText: jsonSignature.json, formattedJSON: newFormattedJSON };
};

export const calculatePedersen = async (json: Ascii[]): Promise<string> => {
    const pedersenHash = await buildPedersenHash();
    const hash = pedersenHash.hash(json);
    return hash;
}



export const generateEddsaSignature = async (privateKey: Uint8Array, msg: Uint8Array) => {
    // TODO: I would love to understand more how this actually works with Pedersen
    eddsa = await buildEddsa();
    babyJub = await buildBabyjub();

    const pubKey = eddsa.prv2pub(privateKey);

    const pPubKey = babyJub.packPoint(pubKey);

    const signature = eddsa.signPedersen(privateKey, msg);

    const pSignature = eddsa.packSignature(signature);

    return {pSignature, msg, pPubKey};
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
