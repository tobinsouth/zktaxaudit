pragma circom 2.1.2;

include "circomlib/circuits/eddsa.circom";
include "circomlib/circuits/pedersen.circom";
// include "circomlib/circuits/bitify.circom";

template TaxAudit (maxJSONsize) {
    // This circuit takes in a JSON as a string up to size maxJSONsize, as well as the signature & public key from a signer. 
    // The JSON will be passed with whitespace up to maxJSONsize. bufferCutoff is the length of the true JSON
    // The script first validates the signature.


    signal input jsonString[maxJSONsize];
    signal input redactMap[maxJSONsize];
    signal input bufferCutoff;
    signal output jsonStringOutput[maxJSONsize];

    signal input hashJsonProgram; // is a Pederson hash of the padded stringified JSON program, passed as hex

    signal input servicePubkey[256]; // Public 
    signal input S[256]; // S is first 32 bits of EdDSA signature, passed as bits
    signal input R8[256]; // R8 is second 32 bits of EdDSA signature, passed as bits

    signal output pedersenHashResult[2];

    // Verify json hashes to provided hash
    // TODO: Issue here were we have to use maxJSONsize not bufferSize
    component pedersen = Pedersen(maxJSONsize);
    for (var i = 0; i < maxJSONsize; i++) {
        pedersen.in[i] <== jsonString[i];
    }
    pedersenHashResult <== pedersen.out;

    // Assert hash is the same as what is passed in (exluding trailing 0s)
    // pedersenHashResult[0] === hashJsonProgram;


    // First constrain that passed in JSON is indeed what was signed
    // component hash2bits = Num2Bits(254);
    // hash2bits.in <== hashJsonProgram;

    component eddsa = EdDSAVerifier(maxJSONsize);
    eddsa.A <== servicePubkey;
    eddsa.R8 <== R8;
    eddsa.S <== S;
    eddsa.msg  <== jsonString; 

    // // Logic for doing redaction to create output
    for(var i=0; i<maxJSONsize; i++){
        // Set to JSON string if redactMap[i] == 1 else set to blank space (32)
        jsonStringOutput[i] <==  jsonString[i]*redactMap[i] + 32*(1-redactMap[i]);
    }

}

component main { public [ servicePubkey ] } = TaxAudit(784);

// { public [ pubServiceKey ] }

/* INPUT = {
    "jsonString":["123","34","83","83","78","34","58","34","48","48","48","45","48","48","45","48","48","48","48","34","44","34","102","110","97","109","101","34","58","34","68","79","78","65","76","68","32","74","34","44","34","108","110","97","109","101","34","58","34","84","82","85","77","80","34","44","34","97","100","100","114","101","115","115","95","115","116","97","116","101","34","58","34","70","76","34","44","34","102","95","49","34","58","34","51","57","51","44","50","50","57","34","44","34","102","95","50","97","34","58","34","50","44","50","48","56","34","44","34","102","95","50","98","34","58","34","49","48","44","54","50","54","44","49","55","57","34","44","34","102","95","51","97","34","58","34","49","55","44","54","57","52","34","44","34","102","95","51","98","34","58","34","50","53","44","51","52","55","34","44","34","102","95","52","97","34","58","34","34","44","34","102","95","52","98","34","58","34","34","44","34","102","95","53","97","34","58","34","34","44","34","102","95","53","98","34","58","34","56","54","44","53","51","50","34","44","34","102","95","54","97","34","58","34","34","44","34","102","95","54","98","34","58","34","34","44","34","102","95","55","34","58","34","34","44","34","102","95","56","34","58","34","45","49","53","44","56","50","53","44","51","52","53","34","44","34","102","95","57","34","58","34","45","52","44","54","57","52","44","48","53","56","34","44","34","102","95","49","48","97","34","58","34","49","48","49","44","54","57","57","34","44","34","102","95","49","48","98","34","58","34","34","44","34","102","95","49","48","99","34","58","34","49","48","49","44","54","57","57","34","44","34","102","95","49","49","34","58","34","45","52","44","55","57","53","44","55","53","55","34","44","34","102","95","49","50","34","58","34","57","49","53","44","49","55","49","34","44","34","102","95","49","51","34","58","34","34","44","34","102","95","49","52","34","58","34","57","49","53","44","49","55","49","34","44","34","102","95","49","53","34","58","34","48","34","44","34","102","95","49","54","34","58","34","48","34","44","34","102","95","49","55","34","58","34","34","44","34","102","95","49","56","34","58","34","48","34","44","34","102","95","49","57","34","58","34","34","44","34","102","95","50","48","34","58","34","34","44","34","102","95","50","49","34","58","34","34","44","34","102","95","50","50","34","58","34","48","34","44","34","102","95","50","51","34","58","34","50","55","49","44","57","55","51","34","44","34","102","95","50","52","34","58","34","50","55","49","44","57","55","51","34","44","34","102","95","50","53","97","34","58","34","56","51","44","57","49","53","34","44","34","102","95","50","53","98","34","58","34","34","44","34","102","95","50","53","99","34","58","34","49","44","55","51","51","34","44","34","102","95","50","53","100","34","58","34","56","53","44","54","52","57","34","44","34","102","95","50","54","34","58","34","49","51","44","54","51","53","44","53","50","48","34","44","34","102","95","50","55","34","58","34","34","44","34","102","95","50","56","34","58","34","34","44","34","102","95","50","57","34","58","34","34","44","34","102","95","51","48","34","58","34","34","44","34","102","95","51","49","34","58","34","49","57","44","51","57","55","34","44","34","102","95","51","50","34","58","34","49","57","44","51","57","55","34","44","34","102","95","51","51","34","58","34","49","51","44","55","52","48","44","53","54","54","34","44","34","102","95","51","52","34","58","34","49","51","44","52","54","56","44","53","57","51","34","44","34","102","95","51","53","97","34","58","34","34","44","34","102","95","51","53","98","34","58","34","48","48","48","48","48","48","48","48","48","34","44","34","102","95","51","54","34","58","34","56","44","48","48","48","44","48","48","48","34","44","34","102","95","51","55","34","58","34","34","44","34","121","101","97","114","34","58","34","50","48","50","48","34","44","34","102","111","114","109","34","58","34","49","48","52","48","34","125"],
    "redactMap":["1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","1","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","1"],
    "bufferCutoff":784,
    "hashJsonProgram": 113759209656574741559917606003372121791104796654757573228026922712760574523036,
    "servicePubkey":["1","1","0","0","1","1","0","0","1","1","0","1","0","0","1","0","0","0","0","0","1","0","0","1","1","0","1","0","1","0","1","0","1","0","0","1","1","0","0","1","1","0","1","1","1","0","1","1","0","0","0","0","1","1","0","1","1","0","1","0","0","1","0","1","1","0","1","1","1","1","1","1","0","0","0","1","0","0","1","0","0","1","1","1","1","0","0","1","0","0","0","1","0","0","1","1","0","0","1","1","0","1","0","0","0","1","0","1","1","1","1","0","0","0","1","0","1","0","0","0","0","0","1","1","0","1","1","0","0","0","1","1","1","1","0","0","1","1","1","1","1","1","1","1","0","0","1","0","0","0","1","0","1","1","0","1","0","1","1","1","1","1","1","1","1","1","1","1","1","1","0","0","0","1","1","0","0","0","0","1","0","0","0","0","1","1","1","0","0","0","0","1","0","0","1","1","0","1","1","0","1","1","0","1","0","0","1","1","1","1","1","1","1","1","0","1","1","1","1","1","1","1","0","1","0","1","1","0","1","1","0","1","1","1","1","0","1","0","1","0","1","0","0","0","1","1","0","0","1","0","0","0","1","0","0","0"],
    "R8":["0","0","0","0","0","0","0","1","1","0","1","0","1","0","0","0","1","1","0","1","1","0","1","1","0","0","1","0","0","0","1","1","1","0","0","1","0","0","1","0","0","1","1","0","1","1","1","1","0","1","0","0","1","1","1","1","0","0","1","0","1","0","0","0","1","1","0","1","1","1","0","0","0","1","0","0","1","1","0","0","1","1","0","1","0","1","0","0","0","1","0","0","1","0","0","0","1","0","1","0","0","0","1","0","1","0","1","0","0","1","1","0","0","0","1","1","0","0","0","0","0","0","1","1","1","1","0","1","1","1","0","1","1","1","0","1","0","1","0","0","1","0","1","1","1","0","0","0","1","0","0","1","1","1","1","0","0","0","1","0","1","0","0","0","1","1","0","1","1","0","1","1","0","0","1","0","0","0","0","0","0","0","1","1","0","0","1","1","0","1","0","0","1","0","0","1","0","1","0","1","0","1","1","1","0","1","0","1","1","0","0","0","1","0","1","1","1","1","0","0","0","1","0","1","1","1","1","1","1","1","1","0","0","0","1","1","1","0","1","1","1","0","1","0","0","1","0","1","1","1","1","1","0","0","0","0"],
    "S":["1","1","1","0","1","1","0","1","0","1","1","0","1","1","1","1","0","0","1","0","0","1","0","1","0","0","0","0","1","1","0","1","1","1","0","0","0","1","1","0","0","1","1","1","0","1","1","1","1","0","1","0","0","0","1","1","1","1","0","1","1","0","1","0","0","0","1","0","0","0","1","0","1","0","1","0","1","1","0","1","0","0","1","0","0","1","1","0","1","1","1","0","0","1","1","0","0","0","1","0","0","0","0","0","1","1","0","0","1","0","1","1","1","0","1","1","0","1","0","1","0","1","0","0","1","0","0","1","1","1","0","1","0","0","0","1","0","0","1","0","1","0","0","1","1","1","0","0","1","0","1","0","1","0","0","0","1","0","0","1","1","1","1","1","0","0","1","1","1","0","0","1","1","1","0","1","0","0","1","1","1","0","0","0","0","0","1","0","1","1","0","1","1","0","0","1","0","0","0","1","1","1","0","0","1","0","1","1","1","1","0","1","1","1","0","1","1","0","1","0","1","0","0","0","1","1","1","0","0","1","1","0","0","1","1","0","0","0","1","1","1","1","1","1","1","1","1","0","1","0","1","0","0","0","0","0"]
}
*/
