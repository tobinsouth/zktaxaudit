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
                <meta name="description" content="A generic landing page" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={`w-full flex justify-center items-center py-2 strong`}>
                <div className="w-full flex justify-center items-center">
                    <h1 className="text-xl">
                        zk Tax Auditing
                    </h1>
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