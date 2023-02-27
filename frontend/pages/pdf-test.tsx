import Head from "next/head";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Button } from "../components/button";
import { pdfToJSON } from "../utilities/f1040";

export default function PDFToJson() {

    async function testButton() {
        // Question: What is a good way to make us consistently read fields?
        // We shouldn't expect the fields to be consistently named, right?
        // Note the filled out trump example is from the empty IRS form

        // trump example form
        const formUrl = 'http://localhost:3000/example-forms/f1040-2020-trump.pdf';
        // empty example form from IRS
        // const formUrl = 'http://localhost:3000/example-forms/f1040-2020-empty.pdf';
        const formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer())
        const json1040 = await pdfToJSON(formPdfBytes);
        console.log(json1040);
    }

    async function on1040PDF(e: ChangeEvent<HTMLInputElement>) {
        /*
        Handles the PDF File input. Expects form 1040 from 2020.
        */
        const fileInput = e.target;
        if (!fileInput.files || fileInput.files.length === 0) {
          console.error("No files?!");
          return;
        }
        const file = fileInput.files[0];
        const fBytes = await file.arrayBuffer();
        const json1040 = await pdfToJSON(fBytes);
        console.log(json1040)
    }

    return (
        <>
            <Head>
                <title>F 1040 PDF to JSON : Test / Debug page</title>
                <meta name="description" content="PDF F-1040 to JSON" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="w-full flex justify-center items-center py-2 strong flex-col">
                <div className="flex flex-col justify-center items-center py-10 w-3/4 max-w-md">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                            <svg aria-hidden="true" className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="mb-2 text-md text-gray-500 dark:text-gray-400">Upload 1040 Tax PDF</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        </div>
                        <input id="dropzone-file" name='f1040' type="file" onChange={on1040PDF} className="hidden" />
                    </label>
                </div>

                <div className="py-2">
                    <Button backgroundColor="black" color="white" onClickHandler={() => testButton()}>Test PDF</Button>
                </div>
            </div>

        </>
    );
}