# SolScope - Discord Bot for Solana Wallet Management

SolScope is a Discord bot that enables users to create and manage Solana wallets directly within Discord. It provides a seamless interface for creating wallets, checking balances, and sending SOL tokens to other Discord users.

## Features

- 🎮 **Discord Integration**: Full integration with Discord's slash commands and interactive components
- 💰 **Wallet Management**: Create and manage Solana wallets
- 💸 **Token Transfers**: Send SOL tokens to other Discord users
- 📊 **Balance Tracking**: Check your wallet balance
- 🪂 **Devnet Support**: Test transactions on Solana's devnet
- 🔒 **Secure Storage**: Wallet information is securely stored in a database with encrypted private keys

## Prerequisites

- Node.js (v18 or higher)
- Bun (v1.2.10 or higher)
- MongoDB (for user data storage)
- Discord Bot Token
- Discord Application Client ID

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/solscope.git
cd solscope
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file in the root directory with the following variables:
```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
MONGODB_URI=your_mongodb_connection_string
ENCRYPTION_KEY=your_secure_encryption_key  # Must be at least 32 characters long
```

## Security

The bot uses AES-256-GCM encryption to secure private keys in the database. The encryption key is derived using PBKDF2 with 100,000 iterations. Make sure to:

1. Use a strong encryption key (at least 32 characters)
2. Keep your `.env` file secure and never commit it to version control
3. Regularly rotate your encryption key
4. Back up your encryption key securely

## Usage

1. Start the bot:
```bash
bun run index.ts
```

2. Available Commands:
- `/start` - Create a new wallet or view your existing wallet
- `/send` - Send SOL tokens to another Discord user
  - Parameters:
    - `user`: Select a Discord user to send SOL to
    - `amount`: Amount of SOL to send

## Development

The project is built using:
- TypeScript
- Discord.js for Discord integration
- @solana/web3.js for Solana blockchain interactions
- Mongoose for database operations
- Bun as the JavaScript runtime
- Node.js crypto module for secure encryption

## Project Structure

```
src/
├── commands/     # Discord slash commands
├── db/          # Database models and connection
├── solana/      # Solana blockchain interactions
├── utils/       # Utility functions and encryption service
└── index.ts     # Main application file
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
