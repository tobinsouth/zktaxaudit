//  Basic page to test imports on the console

import React, { useEffect, useState } from "react";
import {
    calculatePoseidon,
    extractPartsFromSignature,
    extractSignatureInputs,
    strHashToBuffer,
} from "../utilities/crypto";

import {
    createJson,
    getRecursiveKeyInDataStore,
    isJSON,
    isJSONStore,
    JSON_EL,
    JSON_STORE,
    MAX_JSON_LENGTH,
    preprocessJson,
    ProofArtifacts,
    REQUIRED_FIELDS,
    toAscii,
} from "../utilities/json";

// Signing stuff with ed & storing keys in localforage 
import * as ed from "@noble/ed25519";
import localforage from "localforage";

export default function Test() {

    const [privKey, setPrivKey] = useState(null);
    const [pubKey, setPubKey] = useState(null);

    useEffect(() => {
        // This function checks that the browser session has a valid keypair stored in localforage or else generates one
        async function checkIsRegistered() {
            const maybePrivKey = await localforage.getItem("zkattestorPrivKey");
            const maybePubKey = await localforage.getItem("zkattestorPubKey");
            if (maybePrivKey && maybePubKey) {
                console.log("Keypair found");
                setPrivKey(maybePrivKey);
                setPubKey(maybePubKey);
            } else {
                setIsLoading(0);
                const privKey = ed.utils.randomPrivateKey();
                const publicKey = await ed.getPublicKey(privKey);
                await localforage.setItem("zkattestorPrivKey", privKey);
                await localforage.setItem("zkattestorPubKey", publicKey);
                console.log("Generated new keypair");
                setPrivKey(privKey);
                setPubKey(publicKey);
            }
            console.log("PrivKey", privKey);
            console.log("PubKey", pubKey);
        }
        checkIsRegistered();
    }, []);


    const getPoseidon = async () => {
        console.log("Test Poseidon");
        let json = '{"a":"b"}';
        let jsonBuffered = '{"a":"b"}           ';
        console.log(toAscii(jsonBuffered));

        let jsonPoseidon = await calculatePoseidon(toAscii(jsonBuffered));
        console.log(jsonPoseidon);

        const signature = await ed.sign(jsonPoseidon, privKey);
        const signedJson = {
            "json": json,
            "servicePubkey": pubKey,
            "signature": signature
        }
        console.log(signedJson);

    }

    return (
        <div>
            <button onClick={getPoseidon}>Test</button>
        </div>
    )
}