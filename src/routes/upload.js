const express = require("express");
const multer = require("multer");
const { uploadToCloudinary } = require("../lib/cloudinary");

const router = express.Router();

// multer 設定（メモリに保存）
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "画像ファイルがありません" });
    }

    // memoryStorageのバッファをbase64に変換
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // Cloudinary にアップロード（base64対応）
    const result = await uploadToCloudinary(base64);

    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error("アップロードエラー: ", err);
    res.status(500).json({ error: "アップロードに失敗しました" });
  }
});

module.exports = router;
