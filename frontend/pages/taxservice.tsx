import Head from "next/head";
import React, { useEffect, useState } from "react";
import Link from 'next/link'


export default function TaxService() {
    return (
        <>
            <Head>
                <title>Tax Service</title>
                <meta name="description" content="Sign your tax PDFs with a JSON" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Link href="/">Home</Link>
        </>
    );
}