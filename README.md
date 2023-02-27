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
* `circuits/json-verify.circom`

### Quirks to be aware of
* The signature is stored as a key-pair in JSON with each character of the hash being stored as an int.