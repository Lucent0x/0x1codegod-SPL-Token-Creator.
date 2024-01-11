import "../App.css"

/**
 * Demonstrates how to create a SPL token and store it's metadata on chain (using the Metaplex MetaData program)
 */


import { Keypair, PublicKey, SystemProgram, Connection, clusterApiUrl, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { MINT_SIZE, TOKEN_PROGRAM_ID, createInitializeMint2Instruction, getMint, getOrCreateAssociatedTokenAccount, getAccount, mintTo } from "@solana/spl-token";

import { PROGRAM_ID as METADATA_PROGRAM_ID, createCreateMetadataAccountV3Instruction, } from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";
  
window.Buffer = window.Buffer || require("buffer").Buffer;

function FungibleTokenV2() { 

 const connection = new Connection( 
        clusterApiUrl('devnet'),
            'confirmed');
 
  const privateKey = process.env.REACT_APP_SECRET_KEY_HEX;
  const payer = Keypair.fromSecretKey(bs58.decode(`${privateKey}`))
 
  console.log("Payer address:", payer.publicKey.toBase58());

  // generate a new keypair to be used for our mint
  const mintKeypair = Keypair.generate();
  const mintAddress = mintKeypair.publicKey.toBase58()
  console.log("mint address: ", mintAddress)

 const beginSequenceV2 = async () => {

  // define the assorted token config settings
  const tokenConfig = {
    // define how many decimals we want our tokens to have
    decimals: 9,
    //
    name: "Web3 Ninja Token",
    //
    symbol: "W3N",
    //
    uri: "https://green-ugliest-lizard-736.mypinata.cloud/ipfs/QmaGqBScPJah2FPdz41cVQH1o8H9K7e5FoTpGZ4epsTqCK",
  };

 const airdropSignature = await connection.requestAirdrop(
        payer.publicKey,
        LAMPORTS_PER_SOL,
        ); 

        const latestBlockHash = await connection.getLatestBlockhash();

        await connection.confirmTransaction( {
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: airdropSignature
           }); 

            console.log(`🎉 Airdrop received: https://explorer.solana.com/tx/${airdropSignature}?cluster=devnet`)

  /**
   * Build the 2 instructions required to create the token mint:
   * - standard "create account" to allocate space on chain
   * - initialize the token mint
   */

  // create instruction for the token mint account
  const createMintAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    // the `space` required for a token mint is accessible in the `@solana/spl-token` sdk
    space: MINT_SIZE,
    // store enough lamports needed for our `space` to be rent exempt
    lamports: await connection.getMinimumBalanceForRentExemption(MINT_SIZE),
    // tokens are owned by the "token program"
    programId: TOKEN_PROGRAM_ID,
  });

  // Initialize that account as a Mint
  const initializeMintInstruction = createInitializeMint2Instruction(
    mintKeypair.publicKey,
    tokenConfig.decimals,
    payer.publicKey,
    null,
  );

  /**
   * Alternatively, you could also use the helper function from the
   * `@solana/spl-token` sdk to create and initialize the token's mint 
   * 👇🏼
   const mint = await createMint(
  connection,
  payer,
  mintAuthority.publicKey,
  freezeAuthority.publicKey,
  9 // We are using 9 to match the CLI decimal default exactly
);

  /**
   * Build the instruction to store the token's metadata on chain
   * - derive the pda for the metadata account
   * - create the instruction with the actual metadata in it
   */

  // derive the pda address for the Metadata account
  const metadataAccount = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mintKeypair.publicKey.toBuffer()],
    METADATA_PROGRAM_ID,
  )[0];

  console.log("Metadata address:", metadataAccount.toBase58());

  // Create the Metadata account for the Mint
  const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataAccount,
      mint: mintKeypair.publicKey,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          creators: null,
          name: tokenConfig.name,
          symbol: tokenConfig.symbol,
          uri: tokenConfig.uri,
          sellerFeeBasisPoints: 0,
          collection: null,
          uses: null,
        },
        // `collectionDetails` - for non-nft type tokens, normally set to `null` to not have a value set
        collectionDetails: null,
        // should the metadata be updatable?
        isMutable: true,
      },
    },
  );

  /**
   * Build the transaction to send to the blockchain
   */

  const tx = new Transaction().add(
    createMintAccountInstruction,
    initializeMintInstruction,
    createMetadataInstruction,
   )

  try {
    // actually send the transaction
 const sig = await sendAndConfirmTransaction(connection, tx, [payer, mintKeypair])
    // print the explorer url
    console.log( `🎉 Transaction completed. https://explorer.solana.com/tx/${sig}?cluster=devnet`);
    console.log("Mint KeyPair", mintKeypair.publicKey)
    console.log("Mint Authority", payer.publicKey)

     await mintNewTokens(mintKeypair.publicKey, payer.publicKey, 1_000_000_000_000_000)
  } catch (error) {
    console.error("Failed to send transaction: "+ error );
    throw error;
  }
 }

 const mintNewTokens = async ( mintKeypair: PublicKey,  mintAuthority: PublicKey, amount: number ) =>{
    const mintInfo = await getMint(
                        connection,
                        mintKeypair
                        )

                console.log( "Token Supply: " + mintInfo.supply);
 
                const tokenAccount = await getOrCreateAssociatedTokenAccount(
                        connection,
                        payer,
                        mintKeypair,
                        mintAuthority
                        )
                        
                    console.log("Associated Token Account: " +  tokenAccount.address.toBase58())

                    const tokenAccountInfo = await getAccount(
                        connection,
                        tokenAccount.address
                        )

           console.log("Associated Token Account Initial Balance: " + tokenAccountInfo.amount);

                        await mintTo(
                            connection,
                            payer,
                            mintKeypair,
                            tokenAccount.address,
                            payer.publicKey,
                            amount // because decimals for the mint are set to 9 
                    )
                    console.log(`Tokens Minted to ${payer.publicKey} succesfullly 🎉`)
                    const new_mintInfo = await getMint(
                    connection,
                    mintKeypair
                    )

                    console.log(" latest supply info " + new_mintInfo.supply + " tokens");
                    // 100

                    const new_tokenAccountInfo = await getAccount(
                    connection,
                    tokenAccount.address
                    )

                console.log(tokenAccount.address + " balance is now: " + new_tokenAccountInfo.amount + " tokens");
                // 100

 }
 return (<>
                <button onClick={beginSequenceV2}>beginSequenceV2</button>
                  {/* <button onClick={mintNewTokens}>mint some more </button> */}
            </>)
}

export default FungibleTokenV2;