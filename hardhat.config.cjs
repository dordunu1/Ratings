require("@fhevm/hardhat-plugin");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require("@typechain/hardhat");
require("hardhat-deploy");
require("hardhat-gas-reporter");
require("solidity-coverage");

const MNEMONIC = process.env.MNEMONIC || "play cement much paper mandate rubber marble ketchup over fsfffc survey";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "34c3a5f3ecf54r3fe38b50f4";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "DNXJA8RX2Q3VsfsP7Z68CJXQZSC6AW";

/** @type {import('hardhat/config').HardhatUserConfig} */
const config = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: 0,
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: !!process.env.REPORT_GAS,
  },
  networks: {
    hardhat: {
      accounts: { mnemonic: MNEMONIC },
      chainId: 31337,
    },
    sepolia: {
      accounts: { mnemonic: MNEMONIC, path: "m/44'/60'/0'/0/", count: 10 },
      chainId: 11155111,
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    },

  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contract",
    tests: "./test",
  },
  solidity: {
    version: "0.8.24",
    settings: {
      metadata: { bytecodeHash: "none" },
      optimizer: { enabled: true, runs: 800 },
      evmVersion: "cancun",
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
};module.exports = config;




