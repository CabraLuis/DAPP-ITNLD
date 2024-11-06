require("dotenv").config();
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");
const { ethers } = require("ethers");
const path = require("path");

// Carga el contrato JSON usando fs
const contractPath = path.resolve(
  __dirname,
  "../artifacts/contracts/NFTContract.sol/NFTClass.json"
);
const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));

const {
  PRIVATE_KEY,
  API_URL,
  PUBLIC_KEY,
  PINATA_API_KEY,
  PINATA_SECRET_KEY,
  CONTRACT_ADDRESS,
} = process.env;

async function createImgInfo(imageRoute) {
  console.log("entorno: ", PINATA_API_KEY, PINATA_SECRET_KEY);

  const authResponse = await axios.get(
    "https://api.pinata.cloud/data/testAuthentication",
    {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    }
  );

  const stream = fs.createReadStream(imageRoute);
  const data = new FormData();
  data.append("file", stream);

  const fileResponse = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    data,
    {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    }
  );

  const { data: fileData = {} } = fileResponse;
  const { IpfsHash } = fileData;
  const fileIPFS = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
  console.log(fileIPFS);
  return fileIPFS;
}

async function createJsonInfo(metadata) {
  const pinataJSONbody = {
    pinataContent: metadata,
  };

  const jsonResponse = await axios.post(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    pinataJSONbody,
    {
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    }
  );

  const { data: jsonData = {} } = jsonResponse;
  const { IpfsHash } = jsonData;
  const tokenURI = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
  return tokenURI;
}

async function mintNFT(tokenURI) {
  const provider = new ethers.providers.JsonRpcProvider(API_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const etherInterface = new ethers.utils.Interface(contract.abi);
  const nonce = await provider.getTransactionCount(PUBLIC_KEY, "latest");
  const gasPrice = await provider.getGasPrice();
  const network = await provider.getNetwork();
  const { chainId } = network;

  const transaction = {
    from: PUBLIC_KEY,
    to: CONTRACT_ADDRESS,
    nonce,
    chainId,
    gasPrice,
    data: etherInterface.encodeFunctionData("mintNFT", [PUBLIC_KEY, tokenURI]),
  };
  console.log("transaction data: ", transaction.data);

  const estimateGas = await provider.estimateGas(transaction);
  transaction["gasLimit"] = estimateGas;
  console.log("estimate gas: ", estimateGas);

  const signedTx = await wallet.signTransaction(transaction);
  const transactionReceipt = await provider.sendTransaction(signedTx);
  await transactionReceipt.wait();

  const hash = transactionReceipt.hash;
  console.log("Transaction HASH: ", hash);

  const receipt = await provider.getTransactionReceipt(hash);
  const { logs } = receipt;
  const tokenInBigNumber = ethers.BigNumber.from(logs[0].topics[3]);
  const tokenId = tokenInBigNumber.toNumber();
  console.log("NFT TOKEN ID: ", tokenId);
  return hash;
}

async function createNFT(info) {
  const imgInfo = await createImgInfo(info.imageRoute);
  const metadata = {
    image: imgInfo,
    name: imgInfo.name,
    description: info.description,
    attributes: [
      { trait_type: "color", value: "brown" },
      { trait_type: "background", value: "white" },
    ],
  };

  const tokenUri = await createJsonInfo(metadata);
  const nftResult = await mintNFT(tokenUri);
  return nftResult;
}

async function getTokens() {
  const options = { method: "GET", headers: { accept: "application/json" } };

  const response = await fetch(
    `${API_URL}/getNFTsForOwner?owner=${PUBLIC_KEY}`,
    options
  );

  if (!response.ok) {
    throw new Error("Error al obtener los tokens");
  }

  const result = await response.json();
  return result;
}

async function getTokensFromAddress(address) {
  const options = { method: "GET", headers: { accept: "application/json" } };

  const response = await fetch(
    `${API_URL}/getNFTsForOwner?owner=${address}`,
    options
  );

  if (!response.ok) {
    throw new Error("Error al obtener los tokens");
  }

  const result = await response.json();
  return result;
}
// Exportar la función createNFT para usar en otros módulos
module.exports.createNFT = createNFT;
module.exports.getTokens = getTokens;
// module.exports = getTokensFromAddress;
