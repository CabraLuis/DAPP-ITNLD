require("dotenv").config();
const express = require("express");
const { getTokens } = require("../../Hardhat/scripts/nfts.js");
const { getTokensFromAddress } = require("../../Hardhat/scripts/nfts.js");
const { createImgInfo } = require("../../Hardhat/scripts/nfts.js");

const app = express();
const port = 3001;

app.use(express.json());

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

app.get("/getTokens", async (req, res) => {
  try {
    const result = await getTokens();
    const tokenIds = result.ownedNfts.map((nft) => nft.id.tokenId);
    res.send(tokenIds);
  } catch (error) {
    res.status(500).send({ error: "Error al obtener tokens" });
  }
});

app.get("/getTokens", async (req, res) => {
  try {
    const result = await getTokensFromAddress(req.query.address);
    const tokenIds = result.ownedNfts.map((nft) => nft.id.tokenId);
    res.send(tokenIds);
  } catch (error) {
    res.status(500).send({ error: "Error al obtener tokens" });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
