import React from 'react';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  getMint,
  getAccount
} from '@solana/spl-token';

// Special setup to add a Buffer class, because it's missing
window.Buffer = window.Buffer || require("buffer").Buffer;

function MintToken() {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const fromWallet = Keypair.generate();
  const toWallet = new PublicKey("INSERT YOUR PUBLIC KEY HERE");
  let fromTokenAccount = new PublicKey(); // Change here
  let mint = new PublicKey();

  async function createToken() {
    const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(fromAirdropSignature);

    mint = await createMint(
      connection,
      fromWallet,
      fromWallet.publicKey,
      null,
      9
    );
    console.log(`Create token: ${mint.toBase58()}`);

    fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      fromWallet.publicKey
    );
    console.log(`Create Token Account: ${fromTokenAccount.toBase58()}`);
  }

  async function mintToken() {
    const signature = await mintTo(
      connection,
      fromWallet,
      mint,
      fromTokenAccount, // Change here
      fromWallet.publicKey,
      10000000000
    );
    console.log(`Mint signature: ${signature}`);
  }

  async function checkBalance() {
    const mintInfo = await getMint(connection, mint);
    console.log(mintInfo.supply);

    const tokenAccountInfo = await getAccount(connection, fromTokenAccount); // Change here
    console.log(tokenAccountInfo.amount);
  }

  async function sendToken() {
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet);
    console.log(`toTokenAccount ${toTokenAccount.address}`);

    const signature = await transfer(
      connection,
      fromWallet,
      fromTokenAccount, // Change here
      toTokenAccount.address,
      fromWallet.publicKey,
      1000000000
    );
    console.log(`finished transfer with ${signature}`);
  }

  return (
    <div>
      Mint Token Section
      <div>
        <button onClick={createToken}>Create token</button>
        <button onClick={mintToken}>Mint token</button>
        <button onClick={checkBalance}>Check balance</button>
        <button onClick={sendToken}>Send token</button>
      </div>
    </div>
  );
}

export default MintToken;
