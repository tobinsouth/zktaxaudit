// A component for the header and background of each of the pages
import React from "react";
import { Button } from "./button";


// This will create a simple header and pass through the children
export const Background = ({ children }) => {
    return (
        <>
            <main className="flex flex-col w-full min-h-screen flex-1 px-20 items-center justify-center text-center">
                    <div className="items-center justify-center text-center">
                        {children}
                    </div>
            </main>
        </>
    );
};


export const Header = () => {
    return (
        <div className="flex flex-row items-left justify-start w-full bg-gray-100 mb-2">
            <a href="/">
            <Button color="black" backgroundColor="none">
                {"<<"} Home
            </Button>
            </a>
        </div>
    );
};