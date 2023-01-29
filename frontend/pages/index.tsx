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

            <section className="container mx-auto rounded-md my-2">
                <h2 className="text-6xl font-bold text-center text-gray-800 p-10">
                    zk Tax Auditing
                </h2>

                <div className="flex flex-col text-center items-center">
                    <div className="bg-blue-50 rounded shadow m-6 p-2 max-w-screen-md flex flex-col">
                        <div className="flex flex-row align-middle">
                            <h1 className="text-center text-8xl text-blue-300 p-2">1</h1>
                            <div className="px-6 text-justify">
                                <p className="text-gray-500 text-xl text-center">Tax Form Notary</p>
                                <p className="text-gray-800 text-base py-2">
                                    Suppose the IRS had a service that accepted completed tax forms (PDF) 
                                    and after processing the form returned a JSON representation of the tax return, signed with their
                                    public key.
                                    This information is returned to the tax filer, and has private information such as the Social Security Number, 
                                    and other details about their taxes they may not want to reveal. 
                                </p>
                                <p>    
                                    <strong>Input:</strong> Completed tax form.
                                    <br/>
                                    <strong>Output:</strong> JSON representation of accepted tax form with a signature and public key to verify the IRS signed this information
                                </p>
                            </div>
                        </div>
                        <div className="items-center align-middle text-center py-2">
                            <Link href="/taxservice" passHref> <Button backgroundColor="black" color="white"> Sign Tax PDF </Button> </Link>   
                        </div> 
                    </div>

                    <div className="bg-blue-50 rounded shadow m-6 p-2 max-w-screen-md flex flex-col">
                        <div className="flex flex-row align-middle">
                            <h1 className="text-center text-8xl text-blue-300 p-2">2</h1>
                            <div className="px-6 text-justify">
                                <p className="text-gray-500 text-xl text-center">Create Proof of Tax Paid</p>
                                <p className="text-gray-800 text-base py-2">
                                The tax filer goes to a second service, which takes the signed JSON returned by the IRS, allows them hide the information they wish to keep private, to only keep key information (e.g. total amount paid) revealed.
                                It generates a ZK proof that this information is true.  The tax filer can then share the redacted tax information and proof to prove they did indeed pay this amount.
                                </p>
                                <p>    
                                    <strong>Input:</strong>  Signed tax information returned by IRS (JSON).
                                    <br/>
                                    <strong>Output:</strong> (a) Redacted information to publicly share. (b) Proof redacted information matches information returned by IRS.
                                </p>
                            </div>
                        </div>
                        <div className="items-center align-middle text-center py-2">
                            <Link href="/prove"><Button backgroundColor="black" color="white">Create Redacted Audit & Proof</Button></Link>
                        </div> 
                    </div>
            
                    <div className="bg-blue-50 rounded shadow m-6 p-2 max-w-screen-md flex flex-col">
                        <div className="flex flex-row align-middle">
                            <h1 className="text-center text-8xl text-blue-300 p-2">3</h1>
                            <div className="px-6 text-justify">
                                <p className="text-gray-500 text-xl text-center">Verifying Tax Attestations</p>
                                <p className="text-gray-800 text-base py-2">
                                This is a service that allows anyone to verify the redacted tax information and proof generated by the previous service.
                                </p>
                                <p>    
                                    <strong>Input:</strong>  Any redacted tax information and its associated proof.
                                    <br/>
                                    <strong>Output:</strong> True or False.
                                </p>
                            </div>
                        </div>
                        <div className="items-center align-middle text-center py-2">
                            <Link href="/verify"><Button backgroundColor="black" color="white">Verify Tax Proof</Button></Link>
                        </div> 
                    </div>
                </div>
            </section>

            {/* A section for notes and references */}
            <section className="container p-10 mx-auto bg-blue-50">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
                    Notes
                </h2>
                <div className="flex flex-row align-middle">
                    <div className="px-6">
                        <p>These 3 services can be hosted by the same entity (e.g. the IRS/tax service) or separately hosted. 
                            As long as the public key from the IRS/tax service is known and trusted, the services done by (2) and (3) could
                            operate under a decentralized trust model thanks to Zero-knowledge technology.</p>
                    </div>       
                </div>
            </section>
        </>
    );
}