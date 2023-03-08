import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Textarea } from "../components/textarea";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../components/button";
import { Background, Header } from "../components/header";
import localforage from "localforage";
import * as ed from "@noble/ed25519";
import { JsonViewer } from "@textea/json-viewer";

import toast, { Toaster } from "react-hot-toast";
import {
    isValidJsonSchema,
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
    padJSONString
} from "../utilities/json";
import styled from "styled-components";
import axios from "axios";
import {
    calculatePoseidon,
    extractPartsFromSignature,
    extractSignatureInputs,
    strHashToBuffer,
    calculatePedersen,
    EddsaSignature,
    buffer2bits
} from "../utilities/crypto";
import { Card } from "../components/card";
import Link from "next/link";
import ReactLoading from "react-loading";

import JSConfetti from "js-confetti";
import { producePP } from "../utilities/producePP";

const Container = styled.main`
    .viewProof {
        text-decoration: underline !important;
    }

    .underlineContainer {
        text-decoration: underline !important;
    }
`;

export default function RedactAndProve() {
    const [jsonDisplayText, setJsonDisplayText] = useState<string>(""); // The input JSON as text
    const [isLoading, setIsLoading] = useState<number | undefined>(2);
    const [hasKeypair, setHasKeypair] = useState<boolean>(false);
    const [proofArtifacts, setProofArtifacts] = useState<ProofArtifacts | undefined>(undefined);
    const [stringifiedJSON, setStringifiedJSON] = useState<string>(""); // The JSON stringified to string
    const [JsonDataStore, setJsonDataStore] = useState<JSON_STORE>({}); // Used to determine which fields are ticked
    const [confetti, setConfetti] = useState<any>(undefined);
    const [signatureStuff, setSignatureStuff] = useState<EddsaSignature>();


    // const circuitInputs = useRef<ExtractedJSONSignature & { hash: string }>();

    const setRecursiveKeyInDataStore = (keys: string[]) => {
        // TODO: Unfinished
        let newJson = { ...JsonDataStore };
        let ptr: JSON_EL | JSON_STORE = newJson;
        for (var key of keys) {
            if (isJSONStore(ptr) && typeof key === "string" && ptr[key] && ptr[key]) {
                ptr = ptr[key];
            } else {
                // ERROR
            }
        }
        if (!isJSONStore(ptr)) {
            ptr["ticked"] = !ptr["ticked"];
        }
        setJsonDataStore(newJson);
    };

    const generateJSON = async () => {
        // Takes in the pasted text and produces the json to be shown in the US and the JSON_STORE object

        console.log("Generating JSON", jsonDisplayText)
        // extractSignatureInputs takes the JSON text and extracts the signature, pubkey, and formatted JSON
        const extracted = extractSignatureInputs(jsonDisplayText); 

        // This function takes the extracted JSON and creates a JSON_STORE object which will then be displayed in the UI
        let newJsonDataStore: JSON_STORE = {};
        let contentJsonWithoutSignature = extracted.jsonText;
        createJson(contentJsonWithoutSignature, newJsonDataStore);
        setJsonDataStore(newJsonDataStore);

        // We save this for generateProof
        setStringifiedJSON(extracted.stringifiedJSON);
        const signatureParts = extractPartsFromSignature(extracted.packedSignature, extracted.servicePubkey);
        setSignatureStuff(signatureParts);

        console.log("Generated JSON")
    };

    const generateProof = async () => {

        console.log("Beginning generateProof")
        try{
            // This JSON check should be done in generateJSON
            // if (!isJSON(jsonDisplayText) || !isJSON(stringifiedJSON)) {
            //     // Checking everything is valid
            //     toast.error("Invalid JSON");
            //     console.log(jsonDisplayText)
            //     return;
            // }

            if (!signatureStuff) {
                toast.error("Invalid signature");
                return;
            }

            setIsLoading(1);
            if (!isValidJsonSchema(JsonDataStore)) {
                toast.error('Invalid JSON');
            }
            const paddedJSON = padJSONString(stringifiedJSON, MAX_JSON_LENGTH)


            // Find the redacted fields, and create the redaction mask array;
            console.log("JsonDataStore", JsonDataStore)

            const maskArray = new Array(paddedJSON?.length).fill(1);
            for (var key of REQUIRED_FIELDS) {
                if (!JsonDataStore[key]["ticked"]) {
                    let fakeJson = {};
                    fakeJson[key] = JsonDataStore[key]["value"];
                    let fakeJsonStr = JSON.stringify(fakeJson).slice(1,-1);
                    let redactStartIndex = paddedJSON?.indexOf(fakeJsonStr);
                    // In redactStartIndex in undefined throw error
                    if(!(redactStartIndex >0)){
                        console.log("Redaction error", fakeJsonStr, paddedJSON);
                    } else {
                        let redactEndIndex = redactStartIndex + fakeJsonStr?.length;
                        for (var i = redactStartIndex; i < redactEndIndex; i++) {
                            maskArray[i] = 0;
                        }
                        // If the redacted field is not the last field in the JSON, we need to remove the comma
                        if (paddedJSON[redactEndIndex] === ",") {
                            maskArray[redactEndIndex] = 0;
                        }
                        console.log("Redacting", redactStartIndex, redactEndIndex)
                    }
                }
            }
            console.log("Mask Array", maskArray);

            // This code will take the maskArray and the stringifiedJSON and replace the string with a space anywhere the maskArray is 1
            let redactedJSON = stringifiedJSON;
            for (var i = 0; i < maskArray.length; i++) {
                if (maskArray[i] === 1) {
                    redactedJSON = redactedJSON?.slice(0, i) + " " + redactedJSON?.slice(i + 1);
                }
            }
            console.log("Redacted JSON", redactedJSON);

            const asciiJsonProgram = toAscii(paddedJSON);
            const hashJsonProgram = await calculatePedersen(asciiJsonProgram);
            const hashJsonProgramBits = buffer2bits(hashJsonProgram);
            const hashJsonProgramHex = hashJsonProgram.toString("hex");
            console.log("ASCII Program", asciiJsonProgram);
            console.log("Hash of JSON", hashJsonProgram);
            console.log("Hash of JSON as bits", hashJsonProgramBits);
            console.log("Hash of JSON as hex", hashJsonProgramHex);

            // Send everthing to circom
            const finalInput = {
                    jsonProgram: asciiJsonProgram,
                    redactMap: maskArray,
                    bufferCutoff: stringifiedJSON?.length,
                    pubServiceKey: signatureStuff.servicePubkey,
                    S: signatureStuff.S,
                    R8: signatureStuff.R8,
                    hashJsonProgram: hashJsonProgramBits,
                };
            console.log("Final Input to prover", finalInput);

            const worker = new Worker("./worker.js");
            worker.postMessage([finalInput, "./jsonFull_final.zkey"]);

            worker.onmessage = async function (e) {
                const { proof, publicSignals, error } = e.data;
                if (error) {
                    toast.error("Could not generate proof, invalid signature");
                    console.error("Proof error", error, error.message);
                } else {
                    setProofArtifacts({ proof, publicSignals });
                    console.log("PROOF SUCCESSFULLY GENERATED: ", proof, publicSignals);
                    toast.success("Generated proof!");
                }
                setIsLoading(undefined);
            };
            
        } catch (e) {
            toast.error("Error generating proof");
            console.error(e);
        }

        // // TODO: This just overrides the proof and produces fake stuff
        // setIsLoading(1);
        // await new Promise(r => setTimeout(r, 2000));
        // const publicSignals = JSON.parse(`{"name":"Tobin","height":"6"}`)
        // const proof = JSON.parse(`{"pi_a":["18294190410516669312947734766168476834733778994004982243123202741391800389625","14634973487720588390542979589285014648526082368841806376872418331570542514454","1"],"pi_b":[["15725569425907313746582249233602641223623240475518950192334299785749380959785","3875975205535093540792760784480902608387614075717885689924469452182683061235"],["6233140625442003470491093169225427542223706586435163311162231687678429973867","7659535409373758863778921753613673563919334217374674318580259056294578860993"],["1","0"]],"pi_c":["8068633704987522987686630547402334866735747304157825731702093502368451040856","10203858953998258933534809613862773075746620743995854119058227060736081190827","1"],"protocol":"groth16","curve":"bn128"}`)
        // setProofArtifacts({ proof, publicSignals });
        // setIsLoading(undefined);
    };


    useEffect(() => {
        setConfetti(new JSConfetti());
    }, []);

    return (
        <>
            <Head>
                <title>ZK JSON</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header/>
            <Background>
            <Container>
                <div className="items-center justify-center text-center">
                <div className={"w-full flex justify-center items-center py-2 strong"}>
                    <h1 className="text-4xl">
                        Redact & Prove Tax Statement
                    </h1>
                </div>

                <p className="mb-2">Paste your JSON then select JSON elements to reveal in ZK-proof</p>
                <div className="py-2"></div>
                <div style={{ width: "800px" }} className="flex flex-col justify-center items-center align-middle text-center">
                    <Textarea 
                        placeholder={"Paste the output of any one of our trusted APIs here (which signs the JSON)"}
                        value={jsonDisplayText}
                        onChangeHandler={(newVal: string) => {
                            setJsonDisplayText(newVal);
                        }}
                    />
                    <div className="py-4"></div>

                    <Button backgroundColor="black" color="white" onClickHandler={generateJSON}>
                        Parse JSON
                    </Button>
                    <div className="py-4"></div>

                    <div className="py-2"></div>
                    <Card dataStore={JsonDataStore} setKeyInDataStore={setRecursiveKeyInDataStore} keys={[]}></Card>
                    <br />
                    <div className="py-2"></div>

                    {Object.keys(JsonDataStore).length > 0 ? (
                        <Button backgroundColor="black" color="white" onClickHandler={generateProof}>
                            {isLoading === 1 ? (
                                <ReactLoading type={"spin"} color={"white"} height={20} width={20} />
                            ) : (
                                "Generate Proof"
                            )}
                        </Button>
                    ) : null}

                    {proofArtifacts && Object.keys(proofArtifacts).length !== 0 ? (
                        <div>
                            <div className="py-2"></div>
                            <div className="flex underlineContainer justify-center items-center text-center">
                                <a
                                    className="viewProof text-underline"
                                    target="_blank"
                                    href={"data:text/json;charset=utf-8," + JSON.stringify(proofArtifacts.proof)}
                                    download={"proof.json"}
                                    rel="noreferrer"
                                >
                                    View Proof
                                </a>
                            </div>
                            <div className="flex underlineContainer justify-center items-center text-center">
                                <a
                                    className="viewProof text-underline"
                                    target="_blank"
                                    href={"data:text/json;charset=utf-8," + JSON.stringify(proofArtifacts.publicSignals)}
                                    download={"publicParams.json"}
                                    rel="noreferrer"
                                >
                                    View Public Info
                                </a>
                            </div>
                        </div>
                    ) : null}
                </div>
                <Toaster />
                </div>
            </Container>
            </Background>
        </>
    );
}
