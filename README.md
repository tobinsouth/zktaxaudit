# zkJSON

This is working copy of the zkjson project created at a Hacklodge.

## Stucture


Takes in a full JSON, a provides a proof of 


## Usage Example

Go to [zkTinder](https://zk-tinder.vercel.app) and put in personal information in the application. 
This will take a known public key and sign the JSON with your information in it. This is effectly acting as a computational notary.

You can then enter the JSON with the original input & the signature into [zjJSON.xyz/partners](https://www.zkjson.xyz). 
This will allow you to hide inputs and the produce a proof of having a valid input JSON that contains the public attributes.

### Understanding this example

Instead of a fake tinder website, you could imagine a server like Coinbase providing a signed JSON with a balance where you can then expose or hide attributes about the JSON they have provided.

### Other Applications
This could also be useful in the context of JSON Web Tokens.



## File Stucture

Main circom file in use is `fullJson.circom`
*Prove ASCII input 
*Provide KEYs to prove 
*Allow recurtsive extraction of values in circom input 
*Requires Fixed lengths 
Fix lengths issues

#### Alterntive: ZK Regex


