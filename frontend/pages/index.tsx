// A simple landing page with links to all three pages

import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { useEffect, useState } from "react";
import { Button } from "../components/button";
import styled from "styled-components";
import Link from 'next/link'


export default function Home() {
    return (
        <>
            <Head>
                <title>Home</title>
                <meta name="description" content="Landing page for ZK Tax Audit" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={`w-full flex justify-center items-center py-2 strong`}>
                <div className="w-full flex justify-center items-center">
                    <h1 className="text-xl">
                        zk Tax Auditing
                    </h1>
                    <p>This is a demo to illustrate a potential future where someone can prove information about their tax 
                        returns (e.g. "I paid a total of $271,973 in taxes in 2020") without revealing other details.
                    </p>
                </div>
            </div>
            <div>
                <div className="explain">
                    <div>
                    <p>(1) Suppose the IRS had a service that accepted completed tax forms (PDF) 
                        and after processing the form returned a JSON representation of the tax return, signed with their
                        public key.
                        This information is returned to the tax filer, and has private information such as the Social Security Number, 
                        and other details about their taxes they may not want to reveal.
                    </p>
                        <ul>
                            <li>Input: Completed tax form</li>
                            <li>Output: JSON representation of accepted tax form with a signature and public key to verify the IRS signed this information</li>
                            <li></li>
                        </ul>
                    </div>
                    <div>
                    <p>(2) The tax filer goes to a second service, which takes the signed JSON returned by the IRS, allows them hide
                        the information they wish to keep private, to only keep key information (e.g. total amount paid) revealed.
                        It generates a ZK proof that this information is true. 
                        The tax filer can then share the redacted tax information and proof to prove they did indeed pay this amount.
                    </p>
                    <ul>
                            <li>Input: Signed tax information returned by IRS (JSON) </li>
                            <li>Output: Redacted information to publicly share</li>
                            <li>Output: Proof redacted information matches information returned by IRS</li>
                        </ul>
                    </div>
                    <div>
                        <p>
                            (3) 
                            
                        </p>
                    </div>
                    <p>These 3 services can be hosted by the same entity (e.g. the IRS/tax service) or separately hosted. 
                        As long as the public key from the IRS/tax service is known and trusted, the services done by (2) and (3) could
                        operate under a decentralized trust model thanks to Zero-knowledge technology.</p>
                </div>
            </div>
            <div className="flex flex-col justify-center items-center">
                <p className="mb-2">You can go to any of the follow three pages.</p>
                <div className="flex space-x-4 flex-row ">
                    <Link href="/taxservice" passHref> <Button backgroundColor="black" color="white"> Sign Tax PDF </Button> </Link>
                    <Link href="/prove"><Button backgroundColor="black" color="white">Create Redacted Audit & Proof</Button></Link>
                    <Link href="/verify"><Button backgroundColor="black" color="white">Verify Tax Proof</Button></Link>
                </div>
            </div>
        </>
    );
}