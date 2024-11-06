require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { createNFT } = require("../../Hardhat/scripts/nfts.js"); // Asegúrate de que la ruta sea correcta

const app = express();
const port = 3000;

// Configuración de multer para manejar archivos
const upload = multer({ dest: "images/" });

// Ruta para crear un NFT
app.post("/create-nft", upload.single("image"), async (req, res) => {
  try {
    const info = {
      imageRoute: req.file.path, // Ruta de la imagen subida
      description: req.body.description, // Descripción de la NFT
    };

    const nftResult = await createNFT(info);
    res.json({ success: true, transactionHash: nftResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
