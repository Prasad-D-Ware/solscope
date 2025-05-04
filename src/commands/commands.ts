import { REST, Routes } from "discord.js";

const commands = [
	{
		name: "start",
		description: "Creates a wallet or shows the exisiting wallet",
	},
	{
		name: "send",
		description: "send sol locally to discord members on solscope",
		options: [
			{
				name: "user",
				description: "Select a Discord user to send SOL to",
				type: 6, // USER type
				required: true,
			},
			{
				name: "amount",
				description: "Amount of SOL to send",
				type: 3,
				required: true,
			},
		],
	},
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN!);

export const registerCommands = async () => {
	try {
		console.log("Started refreshing application (/) commands.");

		await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
			body: commands,
		});
		// console.log(commands);
		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
};
