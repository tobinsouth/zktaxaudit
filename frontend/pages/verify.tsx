import Head from "next/head";
import Link from 'next/link'
import React, { useEffect, useState } from "react";
import JSConfetti from "js-confetti";
import ReactLoading from "react-loading";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { ExtractedJSONSignature, VerifyPayload } from "../utilities/types";
import {
    checkJsonSchema,
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

    const [isLoading, setIsLoading] = useState<number | undefined>(2);
    const [proofArtifacts, setProofArtifacts] = useState<ProofArtifacts | undefined>(undefined);
    // proofArtifacts interface -> {publicSignals: string[]; proof: Object}
    const [confetti, setConfetti] = useState<any>(undefined);

    // User upload proof.json and publicParams.json to get proofArtifacts
    

    const verifyProof = async () => {
        try {
            setIsLoading(2);
            const resultVerified = await axios.post<VerifyPayload>("/api/verify", { ...proofArtifacts });
            if (resultVerified.data.isValidProof) {
                toast.success("Successfully verified proof!");
                confetti
                    .addConfetti({
                        confettiRadius: 50,
                        emojis: ["😘"],
                    })
                    .then((_: any) => confetti.clearCanvas());
            } else {
                toast.error("Failed to verify proof");
            }
            setIsLoading(undefined);
        } catch (ex) {
            setIsLoading(undefined);
            toast.error("Failed to verify proof");
        }
    };


    return (
        <>
            <Head>
                <title>Verify</title>
                <meta name="description" content="A place to verify the proofs" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Link href="/">Home</Link>

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