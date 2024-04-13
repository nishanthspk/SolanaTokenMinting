import React from 'react';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  createSetAuthorityInstruction,
  AuthorityType
} from '@solana/spl-token';

function MintToken() {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const fromWallet = Keypair.generate();
  let fromTokenAccount = new PublicKey();
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
      fromTokenAccount,
      fromWallet.publicKey,
      10000000000 // 10 billion
    );
    console.log(`Mint signature: ${signature}`);
  }

  async function checkBalance() {
    const tokenAccountInfo = await connection.getTokenAccountBalance(fromTokenAccount);
    console.log(`Balance: ${tokenAccountInfo.value.uiAmountString}`);
  }

  async function sendToken() {
    const toWallet = new PublicKey("7GHeiZDhgLpGpN9VEGxygUW5Ab1igQRyhymynuQFbjyB");

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      toWallet
    );

    const signature = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(
        transfer(
          {
            source: fromTokenAccount,
            destination: toTokenAccount,
            amount: 1000000000, // 1 billion
            owner: fromWallet.publicKey,
            tokenProgramId: Token.PROGRAM_ID
          }
        )
      ),
      [fromWallet]
    );

    console.log(`Transfer signature: ${signature}`);
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
