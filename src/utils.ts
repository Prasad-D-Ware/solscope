import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export function createMainMenuButtons() {
	// Top row: Buy and Fund
	const topRow = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("airdrop")
			.setLabel("Airdrop")
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("fund")
			.setLabel("Fund")
			.setStyle(ButtonStyle.Secondary)
	);

	const secondRow = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("wallet")
			.setLabel("Wallet")
			.setStyle(ButtonStyle.Secondary),
		// new ButtonBuilder()
		// 	.setCustomId("settings")
		// 	.setLabel("Settings")
		// 	.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("refresh")
			.setLabel("Refresh")
			.setStyle(ButtonStyle.Secondary)
	);

	return [topRow, secondRow];
}

export function createWalletMenuButtons() {
	const topRow = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("view")
			.setLabel("View on Explorer")
			.setStyle(ButtonStyle.Secondary),
			
		new ButtonBuilder()
			.setCustomId("send")
			.setLabel("Send SOL")
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("balance")
			.setLabel("Get Balance")
			.setStyle(ButtonStyle.Secondary)
	);

	const secondRow = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId("reset")
			.setLabel("Reset Wallet")
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId("export")
			.setLabel("Export Wallet")
			.setStyle(ButtonStyle.Secondary)
	);

	return [topRow, secondRow];
}


export function sendModal() {
	const modal = new ModalBuilder()
		.setCustomId('sendModal')
		.setTitle('Send SOL')
		.addComponents(
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("reciever")
					.setLabel("Receiver's Address")
					.setStyle(TextInputStyle.Short)
					.setRequired(true)
			),
			new ActionRowBuilder<TextInputBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("amount") 
					.setLabel("Amount (SOL)")
					.setStyle(TextInputStyle.Short)
					.setRequired(true)
			)
		);

	return modal;
}
