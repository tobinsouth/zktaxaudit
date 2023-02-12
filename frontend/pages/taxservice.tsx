import Head from "next/head";
import React, { useEffect, useState } from "react";
import Link from 'next/link'
import { Button } from "../components/button";

// Signing stuff with ed & storing keys in localforage 
import * as ed from "@noble/ed25519";
import {
    calculatePoseidon,
    generateEddsaSignature
} from "../utilities/crypto";
import { EddsaSignature } from "../utilities/types";

import localforage from "localforage";

import { Textarea } from "../components/textarea";
import toast, { Toaster } from "react-hot-toast";
import { JsonViewer } from "@textea/json-viewer";

import { REQUIRED_FIELDS, toAscii } from "../utilities/json";

export default function TaxService() {
    const [isLoading, setIsLoading] = useState<number | undefined>(2);
    const [hasKeypair, setHasKeypair] = useState<boolean>(false);
    const [jsonTextInput, setJsonTextInput] = useState<string>(`{"SSN": "000-00-0000", "fname": "DONALD J", "lname": "TRUMP", "state": "FL", "f_1": "393,229", "f_2a": "2,208", "f_2b": "10,626,179", "f_3a": "17,694","f_3b": "25,347","f_4a": "","f_4b": "","f_5a": "","f_5b": "86,532","f_6a": "","f_6b": "", "f_7": "", "f_8": "-15,825,345", "f_9": "-4,694,058", "f_10a": "101,699","f_10b": "","f_10c": "101,699","f_11": "-4,795,757","f_12": "915,171","f_13": "", "f_14": "915,171","f_15": "0","f_16": "0","f_17": "","f_18": "0","f_19": "","f_20": "","f_21": "","f_22": "0","f_23": "271,973","f_24": "271,973","f_25a": "83,915","f_25b": "","f_25c": "1,733","f_25d": "85,649","f_26": "13,635,520","f_27": "","f_28": "","f_29": "","f_30": "","f_31": "19,397","f_32": "19,397","f_33": "13,740,566","f_34": "13,468,593","f_35a": "","f_35b": "000000000","f_35c": "checking","f_35d": "00000000000000000","f_36": "8,000,000","f_37": "","year": "2020","form": "1040"}
    `);
    const [jsonOutput, setJsonOutput] = useState();


    const fixJsonSchema = (json: object) => {
        // This function takes a JSON object and fixes it to be compatible with the JSON schema
        // We do this by making all the keys strings and removing any keys that are not in the schema
        // Schema = ["fname", "lname", "SSN", "10b", "24", "year", "form"]
        const fixedJSON = {};
        // Remove any keys that are not in the schema and fix the order
        for (const key of REQUIRED_FIELDS) {
            if (json.hasOwnProperty(key)) {
                fixedJSON[key] = json[key];
            } else {
                // toast("Missing required field: " + key, { icon: "❗" });
                console.log("Missing required field: " + key)
            }
        }
        return fixedJSON;
    }

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
        // TODO: Better handle how JSON is validated/handled
        try{
            console.log("Trying to parse JSON", json);
            var parsedJSON = JSON.parse(json);
            parsedJSON = fixJsonSchema(parsedJSON);
            json = JSON.stringify(parsedJSON);
            console.log("Parsed JSON");

            const privKey = await localforage.getItem("zkattestorPrivKey");

            // We use the Pedersen signing process from circomlib.js
            const jsonUint8 = new TextEncoder().encode(json); // We quickly convert to JSON to a Uint8Array to sign
            const newSignature = await generateEddsaSignature(privKey, jsonUint8)
            const newJsonOutput = {
                "json": parsedJSON,
                "signature": newSignature.pSignature,
                "servicePubkey": newSignature.pPubKey
            }
            setJsonOutput(newJsonOutput)

            console.log("JSON signed");
            
            toast.success("JSON signed", { icon: "👍" });

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
                    <h1 className="text-center text-4xl m-2">Sign Tax Form</h1>
                    <br/>
                    <p>This page will eventually take in a tax pdf and produce a signed JSON. For the time being we will take in manual values and produce a signed JSON output. </p>


                </div>
                <div className="flex flex-col justify-center items-center py-10 w-3/4 max-w-md">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                            <svg aria-hidden="true" className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="mb-2 text-md text-gray-500 dark:text-gray-400">Upload 1040 Tax PDF</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" />
                    </label>
                </div>
                <div className="justify-center items-center">
                    <h3 className="text-2xl">OR</h3>
                </div>
                <div className="flex flex-col justify-center items-center py-10 w-3/4 ">
                        <Textarea 
                            placeholder={"Input original JSON here"}
                            value={jsonTextInput}
                            onChangeHandler={(newVal: string) => {
                                setJsonTextInput(newVal);
                            }}
                        />
                        <div className="py-2">
                            <Button backgroundColor="black" color="white" onClickHandler={() => signJson(jsonTextInput)}>Sign JSON</Button>
                        </div>
                </div>

                {jsonOutput ? (
                    <>
                        <div className="py-2"></div>
                        <JsonViewer value={jsonOutput} />
                    </>
                ) : null}
                <Toaster />
            </div>
        </>
    );
}