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
import { ExtractedJSONSignature, VerifyPayload } from "../utilities/types";
import {
    calculatePoseidon,
    extractPartsFromSignature,
    extractSignatureInputs,
    strHashToBuffer,
    buffer2bits,
    calculatePedersen
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
    const [jsonText, setJsonText] = useState<string>("");
    const [isLoading, setIsLoading] = useState<number | undefined>(2);
    const [hasKeypair, setHasKeypair] = useState<boolean>(false);
    const [proofArtifacts, setProofArtifacts] = useState<ProofArtifacts | undefined>(undefined);
    const [formattedJSON, setFormattedJSON] = useState<string>();
    const [JsonDataStore, setJsonDataStore] = useState<JSON_STORE>({});
    const [confetti, setConfetti] = useState<any>(undefined);
    const [signatureStuff, setSignatureStuff] = useState<EddsaSignature>();


    // const circuitInputs = useRef<ExtractedJSONSignature & { hash: string }>();

    const setRecursiveKeyInDataStore = (keys: string[]) => {
        // TODO: This doesn't need to be recursive
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
        console.log("Generating JSON", jsonText)
        // extractSignatureInputs takes the JSON text and extracts the signature, pubkey, and formatted JSON
        const extracted = extractSignatureInputs(jsonText); 

        // This function takes the extracted JSON and creates a JSON_STORE object which will then be displayed in the UI
        let newJsonDataStore: JSON_STORE = {};
        let parsedJson = extracted.jsonText;
        createJson(parsedJson, newJsonDataStore);
        setJsonDataStore(newJsonDataStore);

        // We save this for generateProof
        setFormattedJSON(extracted.formattedJSON);
        const signatureParts = extractPartsFromSignature(extracted.packedSignature, extracted.servicePubkey);
        setSignatureStuff(signatureParts);

        console.log("Generated JSON")
    };
    
    const generateProof = async () => {

        console.log("Beginning generateProof")
        try{
            if (!isJSON(jsonText) || !isJSON(formattedJSON)) {
                // Checking everything is valid
                toast.error("Invalid JSON");
                return;
            }

            if (!signatureStuff) {
                toast.error("Invalid signature");
                return;
            }

            setIsLoading(1);
            if (!isValidJsonSchema(JsonDataStore)) {
                alert('Invalid JSON');
            }
            const paddedJSON = padJSONString(formattedJSON, MAX_JSON_LENGTH)


            // Find the redacted fields, and create the redaction mask array;
            const maskArray = new Array(paddedJSON?.length).fill(0);
            for (var key of REQUIRED_FIELDS) {
                if (JsonDataStore[key]["ticked"]) {
                    let fakeJson = {};
                    fakeJson[key] = JsonDataStore[key]["value"];
                    let fakeJsonStr = JSON.stringify(fakeJson).slice(1,-1);
                    let redactStartIndex = paddedJSON?.indexOf(fakeJsonStr);
                    // In redactStartIndex in undefined throw error
                    if(!(redactStartIndex >0)){
                        console.log("Redaction error", fakeJsonStr, paddedJSON);
                    } else {
                        let redactEndIndex = redactStartIndex + fakeJsonStr?.length - 2;
                        for (var i = redactStartIndex; i < redactEndIndex; i++) {
                            maskArray[i] = 1;
                        }
                        console.log("Redacting", redactStartIndex, redactEndIndex)
                    }
                }
            }
            console.log("Mask Array", maskArray);

            const hashJsonProgram = await calculatePedersen(toAscii(formattedJSON));
            console.log("Hash of JSON", hashJsonProgram);
            
            // Send everthing to circom
            const finalInput = {
                    jsonProgram: paddedJSON,
                    redactMap: maskArray,
                    bufferCutoff: formattedJSON?.length,
                    pubServiceKey: signatureStuff.servicePubkey,
                    S: signatureStuff.S,
                    R8: signatureStuff.R8,
                    hashJsonProgram: hashJsonProgram,
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
                        value={jsonText}
                        onChangeHandler={(newVal: string) => {
                            setJsonText(newVal);
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
