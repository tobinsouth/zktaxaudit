import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Textarea } from "../components/textarea";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/button";
import localforage from "localforage";
import * as ed from "@noble/ed25519";
import * as ethers from "ethers";
import { JsonViewer } from "@textea/json-viewer";

import toast, { Toaster } from "react-hot-toast";
import { isJSON, JSONStringifyCustom, padJSONString } from "../utilities/json";
import styled from "styled-components";
import axios from "axios";
import { VerifyPayload } from "../utilities/types";
import { generateEddsaSignature } from "../utilities/crypto";

interface JSON_EL {
    value: string;
    ticked: boolean;
}

interface JSON_STORE {
    [key: string]: JSON_EL;
}

interface ProofArtifacts {
    publicSignals: string[];
    proof: Object;
}

const Container = styled.main`
    .proofLink {
        text-decoration: underline !important;
    }
`;

export default function Home() {
    const [jsonText, setJsonText] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasKeypair, setHasKeypair] = useState<boolean>(false);
    const [signature, setSignature] = useState<Object | undefined>(undefined);
    const [proofArtifacts, setProofArtifacts] = useState<ProofArtifacts | undefined>(undefined);
    const [formattedJSON, setFormattedJSON] = useState<string | undefined>(undefined);
    const [JsonDataStore, setJsonDataStore] = useState<JSON_STORE>({});

    const setKeyInDataStore = (key: string, state: boolean) => {
        let newJson = { ...JsonDataStore };
        //TODO: handle nesting
        if (typeof key === "string" && newJson[key]) {
            newJson[key].ticked = state;
        }
        setJsonDataStore(newJson);
    };

    const handleCheckmarkCheck = (event, key: string) => {
        setKeyInDataStore(key, event.target.checked);
    };

    const generateProof = async () => {
        try {
            if (!isJSON(jsonText)) {
                toast.error("Invalid JSON");
                return;
            }
            setIsLoading(true);
            const hardCoded = {
                hashJsonProgram:
                    BigInt(10058416048496861476264053793475873949645935904167570960039020625334949516197).toString(),
                jsonProgram: [
                    123, 34, 110, 97, 109, 101, 34, 58, 34, 102, 111, 111, 98, 97, 114, 34, 44, 34, 118, 97, 108, 117,
                    101, 34, 58, 49, 50, 51, 44, 34, 109, 97, 112, 34, 58, 123, 34, 97, 34, 58, 116, 114, 117, 101, 125,
                    125, 0, 0, 0, 0,
                ].map((el) => el.toString()),
                keys: [
                    [
                        [34, 109, 97, 112, 34, 0, 0, 0, 0, 0].map((el) => el.toString()),
                        [34, 97, 34, 0, 0, 0, 0, 0, 0, 0].map((el) => el.toString()),
                    ],
                ],
                values: [[116, 114, 117, 101, 0, 0, 0, 0, 0, 0].map((el) => el.toString())],
                keysOffset: [[[29, 33].map((el) => el.toString()), [36, 38].map((el) => el.toString())]],
                valuesOffset: [[40, 43].map((el) => el.toString())],
            };
            // hardCoded.jsonProgram.map(BigInt);

            const worker = new Worker("./worker.js");
            worker.postMessage([hardCoded, "./jsonFull_final.zkey"]);
            worker.onmessage = async function (e) {
                const { proof, publicSignals } = e.data;
                setProofArtifacts({ proof, publicSignals });
                console.log("PROOF SUCCESSFULLY GENERATED: ", proof, publicSignals);
                toast.success("Generated proof!");
                setIsLoading(false);
            };
        } catch (ex) {
            console.error(ex);
            toast.error("Something went wrong :(");
        }
    };

    useEffect(() => {
        async function checkIsRegistered() {
            const maybePrivKey = await localforage.getItem("zkattestorPrivKey");
            const maybePubKey = await localforage.getItem("zkattestorPubKey");
            if (maybePrivKey && maybePubKey) {
                setHasKeypair(true);
            } else {
                setIsLoading(true);
                const privKey = ed.utils.randomPrivateKey();
                const publicKey = await ed.getPublicKey(privKey);
                await localforage.setItem("zkattestorPrivKey", privKey);
                await localforage.setItem("zkattestorPubKey", publicKey);
                setIsLoading(false);
            }
        }
        checkIsRegistered();
    }, []);

    const signJSON = async () => {
        if (!isJSON(jsonText)) {
            toast.error("Invalid JSON!");
            return;
        }
        const privateKey = await localforage.getItem("zkattestorPrivKey");
        const newFormattedJSON = padJSONString(JSON.stringify(JSON.parse(jsonText)), 50);
        setFormattedJSON(newFormattedJSON);

        // Populate JSON_STORE with data from JSON.parse(jsonText);
        let newJsonDataStore: JSON_STORE = {};
        let parsedJson = JSON.parse(jsonText);
        Object.keys(parsedJson).forEach((key) => {
            newJsonDataStore[key] = {
                value: parsedJson[key],
                ticked: false,
            };
        });
        console.log("formatted: ", newFormattedJSON.length, jsonText.length);
        // const signature = await ed.sign(ethers.utils.toUtf8Bytes(newFormattedJSON), privateKey as string);
        const signature = await generateEddsaSignature(
            privateKey as Uint8Array,
            ethers.utils.toUtf8Bytes(newFormattedJSON)
        );
        console.log(JSONStringifyCustom(signature));
        setSignature(signature);
    };

    const recursivelyResolveObject = (obj: Record<string, any>) => {
        if (typeof obj !== "object") {
            return obj;
        }
    };

    const verifyProof = async () => {
        try {
            const resultVerified = await axios.post<VerifyPayload>("/api/verify", { ...proofArtifacts });
            if (resultVerified.data.isValidProof) {
                toast.success("Successfully verified proof!");
            } else {
                toast.error("Failed to verify proof");
            }
        } catch (ex) {
            toast.error("Failed to verify proof");
        }
    };

    return (
        <>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Container className={styles.main}>
                <div className={`${styles.coolBackground} flex justify-center items-center py-2 strong`}>
                    <h1 className="text-xl">zkJSON</h1>
                </div>

                <p className="mb-2">Select JSON elements to reveal in ZK-proof</p>
                <div className="py-2"></div>
                <div style={{ width: "800px" }} className="flex flex-col justify-center items-center">
                    {!hasKeypair ? (
                        "generating your key pair..."
                    ) : (
                        <div className="w-full flex flex-col items-center justify-center">
                            <Textarea
                                placeholder={"Paste your JSON string"}
                                value={jsonText}
                                onChangeHandler={(newVal: string) => {
                                    setJsonText(newVal);
                                }}
                            />
                            <div className="py-4"></div>

                            <Button backgroundColor="black" color="white" onClickHandler={signJSON}>
                                Sign JSON
                            </Button>
                        </div>
                    )}

                    {formattedJSON ? (
                        <>
                            <div className="py-2"></div>
                            <JsonViewer value={formattedJSON} />
                        </>
                    ) : null}
                    <br />

                    <ul>
                        <>
                            {Object.keys(JsonDataStore).map((key, index) => {
                                return (
                                    <div key={index}>
                                        <label className="inline-flex items-center ml-6">
                                            <input
                                                type="checkbox"
                                                className="mr-4 pt-2 form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                                onChange={(e) => handleCheckmarkCheck(e, key)}
                                                checked={JsonDataStore[key] ? JsonDataStore[key].ticked : false}
                                            />
                                        </label>
                                        <strong className="mb-4">{key}:</strong>{" "}
                                        {typeof JsonDataStore[key]["value"] !== "object"
                                            ? JsonDataStore[key]["value"]
                                            : JSON.stringify(JsonDataStore[key]["value"])}
                                    </div>
                                );
                            })}
                        </>
                    </ul>
                    <div className="py-2"></div>
                    {jsonText && signature && (
                        <Button backgroundColor="black" color="white" onClickHandler={generateProof}>
                            {isLoading ? "loading..." : "Generate Proof"}
                        </Button>
                    )}
                    {proofArtifacts && Object.keys(proofArtifacts).length !== 0 ? (
                        <div>
                            <div className="py-2"></div>
                            <div className="flex justify-center items-center text-center">
                                <a
                                    className="proofLink"
                                    target="_blank"
                                    href={"data:text/json;charset=utf-8," + JSON.stringify(proofArtifacts.proof)}
                                    download={"proof.json"}
                                    rel="noreferrer"
                                >
                                    View Proof
                                </a>
                            </div>
                            <div className="py-2"></div>
                            <Button backgroundColor="black" color="white" onClickHandler={verifyProof}>
                                {isLoading ? "loading..." : "Verify Proof"}
                            </Button>
                        </div>
                    ) : null}
                </div>
                <Toaster />
            </Container>
        </>
    );
}
