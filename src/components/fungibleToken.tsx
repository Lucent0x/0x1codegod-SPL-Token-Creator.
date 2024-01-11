import '../App.css';
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL} from '@solana/web3.js';
import { createMint, getMint, getOrCreateAssociatedTokenAccount, getAccount, mintTo } from '@solana/spl-token';
import bs58 from "bs58";

// const payer = Keypair.generate();
// const mintAuthority = Keypair.generate();
// const freezeAuthority = Keypair.generate();


  const privateKey = process.env.REACT_APP_SECRET_KEY_HEX;
  const payer = Keypair.fromSecretKey(bs58.decode(`${privateKey}`))
  const mintAuthority = payer;
  const freezeAuthority = payer;
  
window.Buffer = window.Buffer || require("buffer").Buffer;

function FungibleToken() {

 const Create_Fungible_Token = async ( )  =>{
    
    try{
            const connection = new Connection(
            clusterApiUrl('devnet'),
            'confirmed'
            );

        const airdropSignature = await connection.requestAirdrop(
        payer.publicKey,
        LAMPORTS_PER_SOL,
        );

        const latestBlockHash = await connection.getLatestBlockhash();

        await connection.confirmTransaction( {
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: airdropSignature }); 

            console.log(`🎉 Airdrop received: https://explorer.solana.com/tx/${airdropSignature}?cluster=devnet`)

            const mint = await createMint(
                    connection,
                    payer,
                    mintAuthority.publicKey,
                    freezeAuthority.publicKey,
                    9 // We are using 9 to match the CLI decimal default exactly
                    );

                 console.log(` 🎉Fungible Token Program deployed at: https://explorer.solana.com/address/${mint.toBase58()}?cluster=devnet`);

                const mintInfo = await getMint(
                        connection,
                        mint
                        )

                console.log( "Token Supply: " + mintInfo.supply);
 
                const tokenAccount = await getOrCreateAssociatedTokenAccount(
                        connection,
                        payer,
                        mint,
                        payer.publicKey
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
                            mint,
                            tokenAccount.address,
                            mintAuthority,
                            100_000_000_000 // because decimals for the mint are set to 9 
                    )
                    console.log(`Tokens Minted to ${mintAuthority} succesfullly 🎉`)

                    const new_mintInfo = await getMint(
                    connection,
                    mint
                    )

                console.log(" latest supply info " + new_mintInfo.supply + " tokens");
                // 100

                const new_tokenAccountInfo = await getAccount(
                connection,
                tokenAccount.address
                )

            console.log(tokenAccount.address + " balance is now: " + new_tokenAccountInfo.amount + " tokens");
            // 100
        }catch(error){
            console.error( error)
        }
 }
  return ( <> 
                        <button onClick={Create_Fungible_Token}>Begin Fungible Token Deployment Sequence.</button>
             </>);
}

export default FungibleToken;
