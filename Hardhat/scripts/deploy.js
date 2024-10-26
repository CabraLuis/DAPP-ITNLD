const { ethers } = require("hardhat");

async function main() {
    const NFT = await ethers.getContractFactory("NFTClass");
    const NFTs = await NFT.deploy()
    const transactionHash = NFTs.deployTransaction.hash
    const transactionReceipt = await ethers.provider.waitForTransaction(transactionHash)
    console.log(`Contract deployed to address: ${transactionReceipt.contractAddress}`)
}

main().then(() => {process.exit(0)}).catch((error) => {
    console.log(error)
    process.exit(1)
})