import {
	Connection,
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
} from "@solana/web3.js";

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

export const getUserBalance = async (publickey : string) =>{
    try {
        const balance = await connection.getBalance(
            new PublicKey(publickey)
        )
		// console.log(balance,"balance");
		if(balance === 0){
			return 0;
		}

        return balance / LAMPORTS_PER_SOL;
    } catch (error : any) {
        return null
    }
}

export const sendSOL = async ( sender : string , receiver : string , amount : number) => {
	
}