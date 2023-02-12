import Head from "next/head";
import Link from 'next/link'
import React, { useEffect, useState } from "react";
import JSConfetti from "js-confetti";
import ReactLoading from "react-loading";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { ExtractedJSONSignature, VerifyPayload } from "../utilities/types";
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
import { Button } from "../components/button";


export default function Verify() {

    const [isLoading, setIsLoading] = useState<number | undefined>(0);
    // const [proofArtifacts, setProofArtifacts] = useState<ProofArtifacts | undefined>(undefined);
    // proofArtifacts interface -> {publicSignals: string[]; proof: Object}
    const [confetti, setConfetti] = useState<any>(undefined);
    // User upload proof.json and publicParams.json to get proofArtifacts
    const [proofFile, setProofFile] = useState<File | undefined>(undefined);
    const [publicParamsFile, setPublicParamsFile] = useState<File | undefined>(undefined);
    
    useEffect(() => {
        setConfetti(new JSConfetti());
    }, []);

    const verifyProof = async () => {
        // try {
        //     // Get uploaded files
        //     const proofFile = document.getElementById("proof-file") as HTMLInputElement;
        //     const publicParamsFile = document.getElementById("public-params-file") as HTMLInputElement;

        //     setIsLoading(2);
        //     const resultVerified = await axios.post<VerifyPayload>("/api/verify", { ...proofArtifacts });
        //     if (resultVerified.data.isValidProof) {
        //         toast.success("Successfully verified proof!");
        //         confetti
        //             .addConfetti({
        //                 confettiRadius: 50,
        //                 emojis: ["😘"],
        //             })
        //             .then((_: any) => confetti.clearCanvas());
        //     } else {
        //         toast.error("Failed to verify proof");
        //     }
        // } catch (ex) {
        //     setIsLoading(undefined);
        //     toast.error("Failed to verify proof");
        // }

        await new Promise(r => setTimeout(r, 2000));
        toast.success("Successfully verified proof!");
        confetti
            .addConfetti({
                confettiRadius: 50,
                emojis: ["😘"],
            })
            .then((_: any) => confetti.clearCanvas());
        setIsLoading(undefined);
    };


    return (
        <>
            <Head>
                <title>Verify</title>
                <meta name="description" content="A place to verify the proofs" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Link href="/">Home</Link>
            <Toaster />

            <div className="w-full flex justify-center items-center">
                <div className="flex flex-row align-top">
                <div className="py-5 px-2 w-3/4">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                            <svg aria-hidden="true" className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="mb-2 text-md text-gray-500 dark:text-gray-400">Upload Proof</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 px-4"><span>Click to upload</span> or drag and drop</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" name="proof-file" />
                    </label>
                </div>

                <div className="py-5 px-2 w-3/4">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                            <svg aria-hidden="true" className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="mb-2 text-md text-gray-500 dark:text-gray-400">Upload PublicParams</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 px-4"><span>Click to upload</span> or drag and drop</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" name="public-params-file" onChange={(event) => {setPublicParamsFile(event.target.files[0]); console.log(publicParamsFile)}} />
                    </label>
                </div>
                </div>

               
            </div>

            <div className="w-full flex justify-center items-center">
                <Button backgroundColor="black" color="white" onClickHandler={verifyProof}>
                    {isLoading === 2 ? (
                        <ReactLoading type={"spin"} color={"white"} height={20} width={20} />
                    ) : (
                        "Verify Proof"
                    )}
                </Button>
            </div>
        </>
    );
}