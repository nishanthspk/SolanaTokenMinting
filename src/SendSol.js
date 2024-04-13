import React, { useState } from 'react';
import {
    clusterApiUrl,
    Connection,
    Transaction,
    Keypair,
    PublicKey,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    SystemProgram
} from '@solana/web3.js';
import {
    getAccount,
    getAssociatedTokenAddress,
    NATIVE_MINT,
    createAssociatedTokenAccountInstruction,
    createSyncNativeInstruction,
    transfer,
    getOrCreateAssociatedTokenAccount,
    closeAccount
} from '@solana/spl-token';

function SendSol() {
    const [associatedTokenAccount, setAssociatedTokenAccount] = useState(null);
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const fromWallet = Keypair.generate();

    async function wrapSol() {
        const airdropSignature = await connection.requestAirdrop(
            fromWallet.publicKey,
            2 * LAMPORTS_PER_SOL,
        );

        await connection.confirmTransaction(airdropSignature);
        const associatedTokenAccount = await getAssociatedTokenAddress(
            NATIVE_MINT,
            fromWallet.publicKey
        );

        const ataTransaction = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                fromWallet.publicKey,
                associatedTokenAccount,
                fromWallet.publicKey,
                NATIVE_MINT
            )
        );

        await sendAndConfirmTransaction(connection, ataTransaction, [fromWallet]);

        const solTransferTransaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: fromWallet.publicKey,
                toPubkey: associatedTokenAccount,
                lamports: LAMPORTS_PER_SOL
            }),
            createSyncNativeInstruction(associatedTokenAccount)
        );

        await sendAndConfirmTransaction(connection, solTransferTransaction, [fromWallet]);
        const accountInfo = await getAccount(connection, associatedTokenAccount);
        console.log(`Native: ${accountInfo.isNative}, Lamports: ${accountInfo.amount}`);

        setAssociatedTokenAccount(associatedTokenAccount);
    }

    async function unwrapSol() {
        const walletBalance = await connection.getBalance(fromWallet.publicKey);
        console.log(`Balance before unwrapping WSOL: ${walletBalance}`)
        await closeAccount(
            connection,
            fromWallet,
            associatedTokenAccount,
            fromWallet.publicKey,
            fromWallet
        );
        const walletBalancePostClose = await connection.getBalance(fromWallet.publicKey);
        console.log(`Balance after unwrapping WSOL: ${walletBalancePostClose}`)
    }

    async function sendSol() {
        const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
        await connection.confirmTransaction(fromAirdropSignature);

        const toWallet = new PublicKey("7GHeiZDhgLpGpN9VEGxygUW5Ab1igQRyhymynuQFbjyB ")

        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromWallet,
            NATIVE_MINT,
            fromWallet.publicKey
        );

        const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, NATIVE_MINT, toWallet);

        const signature = await transfer(
            connection,
            fromWallet,
            fromTokenAccount.address,
            toTokenAccount.address,
            fromWallet.publicKey,
            LAMPORTS_PER_SOL
        );
        console.log('Transfer tx:', signature);
    }

    return (
        <div>
            Send Sol Section
            <div>
                <button onClick={wrapSol}>Wrap SOL</button>
                <button onClick={unwrapSol}>Unwrap SOL</button>
                <button onClick={sendSol}>Send SOL</button>
            </div>
        </div>
    );
}

export default SendSol;
