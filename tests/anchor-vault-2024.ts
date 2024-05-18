import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorVault2024 } from "../target/types/anchor_vault_2024";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

describe("anchor-vault-2024", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.AnchorVault2024 as Program<AnchorVault2024>;

  const connection = anchor.getProvider().connection;

  const maker = Keypair.generate();
  const taker = Keypair.generate();

  const vault = PublicKey.findProgramAddressSync(
    [
      Buffer.from("vault"),
      maker.publicKey.toBuffer(),
    ],
    program.programId,
  )[0];

  const vaultState = PublicKey.findProgramAddressSync(
    [
      Buffer.from("VaultState"),
      maker.publicKey.toBuffer(),
    ],
    program.programId,
  )[0];

  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block,
    });
    return signature;
  };
  
  const log = async (signature: string): Promise<string> => {
    console.log(
      `Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`
    );
    return signature;
  };
  
  it("Airdrop", async () => {
    await connection
      .requestAirdrop(maker.publicKey, LAMPORTS_PER_SOL * 10)
      .then(confirm)
      .then(log);
    await connection
      .requestAirdrop(taker.publicKey, LAMPORTS_PER_SOL * 10)
      .then(confirm)
      .then(log);
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().accountsPartial({
      vault,
      maker: maker.publicKey,
      vaultState,
      taker: taker.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([maker])
    .rpc()
    .then(confirm)
    .then(log);
  });
});
