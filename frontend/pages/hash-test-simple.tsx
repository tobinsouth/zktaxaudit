import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Textarea } from "../components/textarea";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../components/button";
import { Background, Header } from "../components/header";
import localforage from "localforage";
import * as ed from "@noble/ed25519";

const ffjavascript = require("ffjavascript");
const crypto = require("crypto");
// const { groth16 } = require("snarkjs");
// const snarkjs = require("../public/snarkjs.min.js");
const circomlibjs = require("circomlibjs");

export default function HashTest() {
    /** Compute pedersen hash */
    async function pedersenHash(data) {
        let babyJub = await circomlibjs.buildBabyjub()
        let ph = await circomlibjs.buildPedersenHash()

        return babyJub.unpackPoint(ph.hash(data))[0];
    }

    const test1 = async () => {
        console.log('test1');

        const stringifyBigInts = ffjavascript.utils.stringifyBigInts;
        const F = new ffjavascript.ZqField(
          ffjavascript.Scalar.fromString(
            "21888242871839275222246405745257275088548364400416034343698204186575808495617"
          )
        );
        
        function createCommitment(secret) {
          return pedersenHash(secret)
        }
        
        let secret = crypto.randomBytes(31);  
        console.log('secret', secret)                                       // generate random secret
        const createdcommitment = createCommitment(secret);  
        console.log('createdcommitment:', createCommitment)
        // commitment to send
        const cm = stringifyBigInts(F.fromRprLEM(createdcommitment));
        console.log('cm', cm) // 

    };

    return (
        <>
            <Head>
                <title>ZK JSON</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header/>
            <Background>
            <div>
                <div className="items-center justify-center text-center">
                    <div className={"w-full flex justify-center items-center py-2 strong"}>
                        <h1 className="text-4xl">
                            Test Hash
                        </h1>
                    </div>
                    <div style={{ width: "800px" }} className="flex flex-col justify-center items-center align-middle text-center">
                        

                        <Button backgroundColor="black" color="white" onClickHandler={test1}>
                            Test 1
                        </Button>
                        <div className="py-4"></div>

                        <div className="py-2"></div>

                    </div>
                </div>
            </div>
            </Background>
        </>
    );
}
