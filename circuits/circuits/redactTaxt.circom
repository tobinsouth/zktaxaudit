pragma circom 2.1.2;

include "circomlib/poseidon.circom";
// include "circomlib/circuits/eddsa.circom";
// include "circomlib/circuits/bitify.circom";
// include "./poseidonLarge.circom";
include "circomlib/circuits/poseidon.circom";



// include "https://github.com/0xPARC/circom-secp256k1/blob/master/circuits/bigint.circom";

// REQUIRED_FIELDS = ["SSN", "fname", "lname", "state", "f_1", "f_2a", "f_2b", "f_3a", "f_3b", "f_4a", "f_4b", "f_5a", "f_5b", "f_6a", "f_6b", "f_7", "f_8", "f_9", "f_10a", "f_10b", "f_10c", "f_11", "f_12", "f_13", "f_14", "f_15", "f_16", "f_17", "f_18", "f_19", "f_20", "f_21", "f_22", "f_23", "f_24", "f_25a", "f_25b", "f_25c", "f_25d", "f_26", "f_27", "f_28", "f_29", "f_30", "f_31", "f_32", "f_33", "f_34", "f_35a", "f_35b", "f_36", "f_37", "year", "form"];
// len(REQUIRED_FIELDS) = 52

template TaxAudit (maxJSONsize) {
    // This circuit takes in a JSON as a string up to size maxJSONsize, as well as the signature & public key from a signer. 
    // The JSON will be passed with whitespace up to maxJSONsize. bufferCutoff is the length of the true JSON
    // The script first validates the signature.


    signal input jsonString[maxJSONsize];
    signal input redactMap[maxJSONsize];
    signal input bufferCutoff;
    signal output jsonStringOutput[maxJSONsize];

    signal input pubServiceKey[64];
    signal input S[32]; // S is first 32 bits of EdDSA signature 
    signal input R8[32]; // S is second 32 bits of EdDSA signature 

    signal input hashJsonProgram; // is a Pederson hash of the padded stringified JSON program

    // First constrain that passed in JSON is indeed what was signed
    component hash2bits = Num2Bits(254);
    hash2bits.in <== hashJsonProgram;

    component eddsa = EdDSAVerifier(254);
    eddsa.A <== pubServiceKey;
    eddsa.R8 <== R8;
    eddsa.S <== S;
    eddsa.msg  <== hash2bits.out;


    // Verify json hashes to provided hash
    // component poseidon = PoseidonLarge(bufferCutoff);
    for (var i = 0; i < bufferCutoff; i++) {
        poseidon.in[i] <== jsonProgram[i];
    }
    // poseidonHash <== poseidon.out;

    poseidon = Poseidon(bufferCutoff);
    for (var i = 0; i < bufferCutoff; i++) {
        poseidon.in[i] <== jsonProgram[i];
    }

    // Assert hash is the same as what is passed in (exluding trailing 0s)
    poseidon.out === hashJsonProgram;

    // // Logic for doing redaction to create output
    for(var i=0; i<maxJSONsize; i++){
        // Set to JSON string if redactMap[i] == 1 else set to blank space (32)
        jsonStringOutput[i] <==  jsonString[i]*redactMap[i] + 32*(1-redactMap[i]);
    }

}

component main  = TaxAudit(20);

// { public [ pubServiceKey ] }
/* INPUT = {
    "jsonString":["123","34","97","34","58","34","98","34","125",
            "32","32","32","32","32","32","32","32","32","32","32"],
    "redactMap": ["1","0","0","1","1","0","0","0","0","0","0","0","0","0","0","0","0","1","1","0"],
    "bufferCutoff":9,
    "pubServiceKey":["146","65","166","178","186","253","35","225","119","238","220","230","182","67","225","24","38","70","204","98","248","23","147","205","33","88","238","150","68","123","199","27"],
    "S": ["205","127","114","184","59","220","210","65","15","208","10","77","197","80","74","228","146","162","253","88","69","187","114","45","108","222","21","75","118","101","229"],
    "R8": ["60","57","176","198","26","151","218","150","219","103","255","5","38","177","11","149","190","9","158","83","100","116","159","184","227","106","50","85","222","84","152","236","7"]
}
*/

// hashJsonProgram is the poseidon hash from javascript

// json -> '{"a":"b"}'
// "privKey":["146","136","138","206","124","96","12","54","13","62","169","216","159","186","225","75","76","123","190","118","252","139","66","231","5","15","92","215","254","172","113","233"],
// signature -> Uint8Array(64) [
//   205, 127, 114, 184,  59, 220, 210,  65,  15, 208,  10,
//    77, 197,  80,  74, 228, 146, 162, 253,  88,  69, 187,
//   114,  45, 108, 222,  21,  75, 118, 101, 229,  60,  57,
//   176, 198,  26, 151, 218, 150, 219, 103, 255,   5,  38,
//   177,  11, 149, 190,   9, 158,  83, 100, 116, 159, 184,
//   227, 106,  50,  85, 222,  84, 152, 236,   7
// ]
