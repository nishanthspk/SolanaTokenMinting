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
  Account, 
  getMint, 
  getAccount
} from '@solana/spl-token';

function MintToken() {
  return (
    <div >
      Mint Token Section
      <div>
     <button>Create Token</button>
     <button>Mint Token</button>
     <button>Check Balance</button>   
     <button>Send Token</button>
     </div>
    </div>
  );
}

export default  MintToken;
