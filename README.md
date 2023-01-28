# Zero-knowledge Tax Audits

## File Stucture
* `frontend/` has all the page website stuff
* `circuits/` has the circom circuits (and lots of wasted test files etc)

* `frontend/pages/prove.tsx`: the made NextJS page for taking a signed tax JSON and creating a redeacted version JSON + zk proof pair.
  * `frontend/utilities/json.ts`: a bunch of tools that parse the inputted JSON.
  * `frontend/utilities/crypto.ts`: a bunch of tools to allow us to extract signatures & pubkeys as well as using snark friends poseidon hashes.
  * `circuits/circuits/jsonFull.circom`: the main circom circuit that proves the redacted JSON is valid.
  * `frontend/public/worker.js`: this is a async worker that performs the snarkjs groth16 proof using the jsonFull circuit.
  
* `frontend/pages/verify.tsx`: as yet incomplete page to verify the produced proofs
  * `frontend/pages/api/verify.ts`: async worker (via API) that performs the snarkjs groth16 verify step.

### Files that may be redundant:
* `frontend/helpers/*`
* `circuits/utilities`
* `circuits/build.sh`

### Quirks to be aware of
* The signature is stored as a key-pair in JSON with each character of the hash being stored as an int.


--------------
--------------
--------------

Old Notes for Old zkJSON Repo:

# zkJSON

This is working copy of the zkjson project created at a Hacklodge.

## Stucture


Takes in a full JSON, a provides a proof of 

Main circom file in use is `fullJson.circom`
* Prove ASCII input 
* Provide KEYs to prove 
* Allow recurtsive extraction of values in circom input 
* Requires Fixed lengths 
* Fix lengths issues



## Usage Example

Go to [zkTinder](https://zk-tinder.vercel.app) and put in personal information in the application. 
This will take a known public key and sign the JSON with your information in it. This is effectly acting as a computational notary.

You can then enter the JSON with the original input & the signature into [zjJSON.xyz/partners](https://www.zkjson.xyz). 
This will allow you to hide inputs and the produce a proof of having a valid input JSON that contains the public attributes.

### Understanding this example

Instead of a fake tinder website, you could imagine a server like Coinbase providing a signed JSON with a balance where you can then expose or hide attributes about the JSON they have provided.

### Other Applications
This could also be useful in the context of JSON Web Tokens.

#### Alterntive: ZK Regex

