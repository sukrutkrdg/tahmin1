require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { BASE_SEPOLIA_URL, BASE_MAINNET_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true, // <-- Stack too deep hatasını çözer
    },
  },
  defaultNetwork: "hardhat",
  paths: {
    sources: "./src/contracts",
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: {},
    "base-sepolia": {
      url: BASE_SEPOLIA_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 84532,
    },
    "base-mainnet": {
      url: BASE_MAINNET_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 8453,
    },
  },
};