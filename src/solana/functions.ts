import {
	Connection,
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	sendAndConfirmTransaction,
	SystemProgram,
	Transaction,
} from "@solana/web3.js";
import axios from "axios";
import bs58 from "bs58";

const connection = new Connection("https://api.devnet.solana.com");
export const createWallet = () => {
	const keypair = new Keypair();
	return keypair;
};

export const airDropUser = async (publickey: string) => {
	try {
		const airdrop = await connection.requestAirdrop(
			new PublicKey(publickey),
			1 * LAMPORTS_PER_SOL
		);
		console.log(airdrop);
		return true;
	} catch (error: any) {
		return false;
	}
};

export const getUserBalance = async (publickey: string) => {
	try {
		const balance = await connection.getBalance(new PublicKey(publickey));
		// console.log(balance,"balance");
		if (balance === 0) {
			return 0;
		}

		return balance / LAMPORTS_PER_SOL;
	} catch (error: any) {
		return null;
	}
};

export const sendSOL = async (
	sender: string,
	receiver: string,
	amount: string
) => {
	try {
		const keys = sender.split(",").map(Number);
		const secretKeyBytes = Uint8Array.from(keys);
		const payer = Keypair.fromSecretKey(secretKeyBytes);

		const tx = new Transaction().add(
			SystemProgram.transfer({
				toPubkey: new PublicKey(receiver),
				fromPubkey: new PublicKey(payer.publicKey),
				lamports: Number(amount) * LAMPORTS_PER_SOL,
			})
		);

		tx.feePayer = payer.publicKey;
		tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

		await sendAndConfirmTransaction(connection, tx, [payer]);

		return true;
	} catch (error: any) {
		return false;
	}
};

export const getSolPrice = async () => {
	const response = await axios.get(
		"https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
	);
	// console.log(response.data);

	const price = response.data.solana.usd;

	return price;
};


export const base58ToKeypair = (base58PrivateKey : string) => {
	try {
		const privateKeyBuffer = bs58.decode(base58PrivateKey);
		return Keypair.fromSecretKey(privateKeyBuffer);
	} catch (error) {
		throw new Error("Invalid base58 private key.");
	}
}