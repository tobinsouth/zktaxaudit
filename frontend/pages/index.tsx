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
            <div className={styles.main}>
            <div className={`${styles.coolBackground} w-full flex justify-center items-center py-2 strong`}>
                    <div className="w-full flex justify-center items-center">
                        <h1 className="text-xl">
                            zk Tax Auditing
                        </h1>
                    </div>
                </div>
                <p className="mb-2">You can go to any of the follow three pages.</p>
                <div className="flex flex2 flex-row ">
                    <Link href="/signtaxform" passHref> <Button backgroundColor="black" color="white"> Sign Tax PDF </Button> </Link>

                    <Link href="/prove"><button className="py-2 px-4 rounded-md hover:opacity-70 bg-black text-white">Create Redacted Audit & Proof</button></Link>
                    
                    <Link href="/verify"><Button backgroundColor="black" color="white">Verify Tax Proof</Button></Link>
                </div>
            </div>
        </>
    );
}