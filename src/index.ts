import { Client, Events, GatewayIntentBits } from "discord.js";
import { registerCommands } from "./commands/commands";
import connectDB from "./db/connectDB";
import user from "./db/user";
import { airDropUser, createWallet, getUserBalance } from "./solana/functions";
import {
	createMainMenuButtons,
	createWalletMenuButtons,
} from "./utils";

const TOKEN = process.env.TOKEN || "";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

registerCommands();

await connectDB();

client.on(Events.ClientReady, (readyClient) => {
	console.log(`Logged in as ${readyClient.user.tag}!`);
});

// client.on(Events.MessageCreate, async (message) => {
// 	if (message.author.bot) return;

// 	// console.log(message);
// 	// console.log(message.author);
// 	message.reply({
// 		content: "Hi " + message.author.username,
// 	});
// });

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.isChatInputCommand()) {
		if (interaction.commandName === "start") {
			// console.log(interaction.user.id);
			const userId = interaction.user.id;
			const username = interaction.user.username;
			const dbUser: any = await user.findOne({
				userId,
				username,
			});

			// console.log(dbUser + " db user find");

			if (!dbUser) {
				const keypair = createWallet();
				const newUser = await user.create({
					userId,
					username,
					privateKey: keypair.secretKey,
					publicKey: keypair.publicKey.toString(),
				});

				// console.log(newUser + " new user created");
				await interaction.reply({
					content: `Welcome to SolScope Bot \n\n A one stop discord wallet solution for solana \n\n Created Your publicKey :\n ${newUser.publicKey} \n \n interact with the wallet using below options :`,
					// @ts-ignore
					components: createMainMenuButtons(),
					flags: "Ephemeral",
				});
			} else {
				await interaction.reply({
					content: `Welcome to SolScope Bot \n\n A one stop discord wallet solution for solana \n\n Your publicKey :\n ${dbUser.publicKey} \n\n interact with the wallet using below options :`,
					// @ts-ignore
					components: createMainMenuButtons(),
					flags: "Ephemeral",
				});
			}
			// console.log(dbUser);
		}
	} else if (interaction.isButton()) {
		if (interaction.customId === "fund") {
			const userId = interaction.user.id;
			const username = interaction.user.username;
			const fundUser = await user.findOne(
				{
					userId,
					username,
				},
				{
					publicKey: 1,
				}
			);
			interaction.reply({
				content: `Add funds to this address : \n \n ${fundUser?.publicKey} \n`,
				flags: "Ephemeral",
			});
		} else if (interaction.customId === "airdrop") {
			const userId = interaction.user.id;
			const username = interaction.user.username;
			const dropUser = await user.findOne(
				{
					userId,
					username,
				},
				{
					publicKey: 1,
				}
			);
			const success = await airDropUser(dropUser?.publicKey as string);
			const balance = await getUserBalance(dropUser?.publicKey as string);

			if (success && balance) {
				interaction.reply({
					content: `Successfully airdroped for the user at : \n \n ${dropUser?.publicKey} \n \n Current balance for the user is : ${balance} SOL`,
					flags: "Ephemeral",
				});
			} else {
				interaction.reply({
					content: "Failed to airdrop user",
					flags: "Ephemeral",
				});
			}
		} else if (interaction.customId === "balance") {
			const userId = interaction.user.id;
			const username = interaction.user.username;
			const User = await user.findOne(
				{
					userId,
					username,
				},
				{
					publicKey: 1,
				}
			);

			const balance = await getUserBalance(User?.publicKey as string);

			if (balance) {
				interaction.reply({
					content: `Current balance for the user : \n \n ${User?.publicKey} \n \n ${balance} SOL`,
					flags: "Ephemeral",
				});
			} else {
				interaction.reply({
					content: "Failed to fetch balance",
					flags: "Ephemeral",
				});
			}
		} else if (interaction.customId === "refresh") {
			const userId = interaction.user.id;
			const username = interaction.user.username;
			const refUser = await user.findOne(
				{
					userId,
					username,
				},
				{
					publicKey: 1,
				}
			);
			interaction.reply({
				content: `Refreshing Menu : \n\n ${refUser?.publicKey} \n\n`,
				// @ts-ignore
				components: createMainMenuButtons(),
				flags: "Ephemeral",
			});
		} else if (interaction.customId === "wallet") {
			const userId = interaction.user.id;
			const username = interaction.user.username;

			const User = await user.findOne(
				{
					userId,
					username,
				},
				{
					publicKey: 1,
				}
			);

			const balance = await getUserBalance(User?.publicKey as string);
			interaction.reply({
				content: `This is your SolScope Wallet \n \n publicKey : ${User?.publicKey} \n \n Balance : ${balance} SOL \n\n Select options from below`,
				// @ts-ignore
				components: createWalletMenuButtons(),
				flags: "Ephemeral",
			});
		} 
	} 
});

client.login(TOKEN);
