const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 PredictionMarket kontratı Base ağına deploy ediliyor...");

  // Base Sepolia Testnet USDC ve USDT adresleri
  const usdcAddress = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
  const usdtAddress = "0xb20a893fb1ef6d46d97e6dafb0a3d2e0a6af6c3e";

  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  const predictionMarket = await PredictionMarket.deploy(usdcAddress, usdtAddress);

  // Yeni sürümde deployed() yerine waitForDeployment() kullanılıyor.
  await predictionMarket.waitForDeployment();

  console.log("✅ PredictionMarket başarıyla deploy edildi!");
  console.log("📜 Kontrat Adresi:", await predictionMarket.getAddress());
}

// Hata yakalama
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deploy sırasında hata:", error);
    process.exit(1);
  });