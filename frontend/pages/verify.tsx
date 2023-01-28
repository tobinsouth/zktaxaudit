import Head from "next/head";
import Link from 'next/link'
import React, { useEffect, useState } from "react";


export default function Verify() {
    return (
        <>
            <Head>
                <title>Verify</title>
                <meta name="description" content="A place to verify the proofs" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Link href="/">Home</Link>
        </>
    );
}