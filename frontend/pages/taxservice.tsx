import Head from "next/head";
import React, { useEffect, useState } from "react";
import Link from 'next/link'

// Signing stuff with ed & storing keys in localforage 
import * as ed from "@noble/ed25519";
import localforage from "localforage";

import { Textarea } from "../components/textarea";
import toast, { Toaster } from "react-hot-toast";
import { JsonViewer } from "@textea/json-viewer";


export default function TaxService() {
    const [isLoading, setIsLoading] = useState<number | undefined>(2);
    const [hasKeypair, setHasKeypair] = useState<boolean>(false);
    const [jsonTextInput, setJsonTextInput] = useState<string>('{"fname": "Alex", "lname": "Berke", "SSN":"123456789", "10b": 1000, "24": 3000, "year":"2020", "form":"1040" }');
    const [jsonOutput, setJsonOutput] = useState({});

    useEffect(() => {
        // This function checks that the browser session has a valid keypair stored in localforage or else generates one
        async function checkIsRegistered() {
            const maybePrivKey = await localforage.getItem("zkattestorPrivKey");
            const maybePubKey = await localforage.getItem("zkattestorPubKey");
            if (maybePrivKey && maybePubKey) {
                setHasKeypair(true);
                console.log("Keypair found");
            } else {
                setIsLoading(0);
                const privKey = ed.utils.randomPrivateKey();
                const publicKey = await ed.getPublicKey(privKey);
                await localforage.setItem("zkattestorPrivKey", privKey);
                await localforage.setItem("zkattestorPubKey", publicKey);
                console.log("Generated new keypair");
                setIsLoading(undefined);
                setHasKeypair(true);
            }
        }
        checkIsRegistered();
    }, []);

    // A function to sign a JSON object with the private key
    async function signJson(json: string) {
        // TODO: Use checkJsonSchema to validate the JSON input
        try{
            console.log("Trying to parse JSON", json);
            const parsedJSON = JSON.parse(json);

            const privKey = await localforage.getItem("zkattestorPrivKey");
            const publicKey = await localforage.getItem("zkattestorPubKey");
            if (privKey && publicKey) {
                // We quickly convert to JSON to a Uint8Array to sign
                const jsonUint8 = new TextEncoder().encode(json);
                const signature = await ed.sign(jsonUint8, privKey);
                const signedJson = {
                    "json": parsedJSON,
                    "servicePubkey": publicKey,
                    "signature": signature
                }
                setJsonOutput(signedJson);
                toast.success("JSON signed");
            } else {
                toast.error("No keypair found")
            }
        } catch (e) {
            console.log("Error parsing JSON", e);
            toast.error("Error parsing JSON");
        }
    }

    return (
        <>
            <Head>
                <title>Tax Service</title>
                <meta name="description" content="Sign your tax PDFs with a JSON" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {/* <div className="items-right"> <Link href="/">Home</Link> </div> */}
            <div className="w-full flex justify-center items-center py-2 strong flex-col">
                <div>
                    <h1 className="text-center text-xl">Sign Tax PDF</h1>
                    <br/>
                    <p>This page will eventually take in a tax pdf and produce a signed JSON. For the time being we will take in manual values and produce a signed JSON output. </p>
                </div>
                <div style={{ width: "800px" }} className="flex flex-col justify-center items-center py-10">
                        <Textarea
                            placeholder={"Input original JSON here"}
                            value={jsonTextInput}
                            onChangeHandler={(newVal: string) => {
                                setJsonTextInput(newVal);
                            }}
                        />
                        <button onClick={() => signJson(jsonTextInput)}>Sign JSON</button>
                        {jsonOutput ? (
                            <>
                                <div className="py-2"></div>
                                <JsonViewer value={jsonOutput} />
                            </>
                        ) : null}

                </div>
            </div>
        </>
    );
}