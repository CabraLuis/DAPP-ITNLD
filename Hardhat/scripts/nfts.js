require("dotenv")
const fs = require("fs")
const FormData = require("form-data")
const axios = require ("axios")
const { ethers, Signer } = require("ethers");
const contract = require("../artifacts/contracts/NFTContract.sol/NFTClass.json")

const {
    PUBLIC_KEY,
    PRIVATE_KEY,
    API_URL,
    PINATA_API_KEY,
    PINATA_SECRET_KEY,
    CONTRACT_ADDRESS
} = process.env

async function createImageInfo(imageRoute) {
    const authResponse = await axios.get("https://api.pinata.cloud/data/testAuthentication",
        {
            headers: {
                pinata_api_key : `${PINATA_API_KEY}`,
                pinata_secret_api_key: `${PINATA_SECRET_KEY}`
            }
        }
    )
    console.log(authResponse)
    const stream = fs.createReadStream(imageRoute)
    const data = new FormData()
    data.append("file", stream)
    const fileResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
        headers: {
            "Content-type":`multipart/form-data: boundary=${data._boundary}`,
            pinata_api_key: `${PINATA_API_KEY}`,
            pinata_secret_api_key: `${PINATA_SECRET_KEY}`
        }
    })
    const {data: fileData = {}} = fileResponse
    const IpfsHash = fileData
    const fileIPFS = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`
    return fileIPFS
}

async function createJsonInfo(metadata) {
    const pinataJSONBody = {pinataContent: metadata}   
    const jsonResponse = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        pinataJSONBody,
        {
            headers: {
                "Content-Type": "application/json",
                pinata_api_key: `${PINATA_API_KEY}`,
                pinata_secret_api_key: `${PINATA_SECRET_KEY}`
            }
        }
    )
    const {data: jsonData = {}} = jsonResponse;
    const {IpfsHash} = jsonData
    const tokenURI = `https://gateway.pinata.cloud.ipfs/${IpfsHash}`
    return tokenURI
}

async function mintNFT(tokenURI) {
    const provider = new ethers.providers.JsonRpcProvider(`${API_URL}`)
    const wallet = new ethers.Wallet(`${PRIVATE_KEY}`, provider)
    const etherInterface = new ethers.utils.Interface(contract.abi)
    const nonce = await provider.getTransactionCount(`${PUBLIC_KEY}`, 'lastest')
    const gasPrice = await provider.getGasPrice()
    const network = await provider.getNetwork()
    const {chainID} = network

    const transaction = {
        from: `${PUBLIC_KEY}`,
        to: `${CONTRACT_ADDRESS}`,
        nonce,
        chainID,
        gasPrice,
        data: etherInterface.encodeFunctionData("mintNFT", [`${PUBLIC_KEY}`,tokenURI])
    }

    const estimateGas = await provider.estimateGas(transaction)
    transaction["gasLimit"] = estimateGas
    const singedTransaction = await wallet.signTransaction(transaction)
    const transactionReceipt = await provider.sendTransaction(singedTransaction)
    await transactionReceipt.wait()
    const hash = transactionReceipt.hash
    console.log("Transaction Hash: ", hash)

    const receipt = await provider.getTransactionReceipt(hash)
    const {logs} = receipt
    const tokenInBigNumber = ethers.BigNumber.from(logs[0].topics[3])
    const tokenID = tokenInBigNumber.toNumber()
    console.log("NFT Token ID:", tokenID)
    return hash
}

async function createNFT(){
    var imgInfo = await createImageInfo("../images/plok.png");
    const metadata = {
        image:imgInfo,
        name:imgInfo.name,
        description:info.description,
        attributes:[
            {'trait_type':'color','value':'brown'},
            {"trait_type":'background','value':'white'}
        ]
    }
    var tokenUri = await createJsonInfo(metadata)
    var nftResult = await mintNFT(tokenUri)
    return nftResult
}

module.exports = {
    createdNFT: createNFT
}

createNFT()