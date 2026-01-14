const express = require("express");
const prisma = require("../prisma");
const authenticate = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const requireAnyRole = require("../middlewares/requireAnyRole");

const router = express.Router();
router.use(authenticate);

router.get("/", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return res.json(products);
});

router.get("/:id", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }
  return res.json(product);
});

router.post("/", requireRole("ADMIN"), async (req, res) => {
  const { productCode, name } = req.body;
  if (!productCode || !name) {
    return res.status(400).json({ message: "productCode and name are required." });
  }

  const product = await prisma.product.create({
    data: { productCode, name }
  });

  return res.status(201).json(product);
});

router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const { productCode, name } = req.body;

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { productCode, name }
  });

  return res.json(product);
});

module.exports = router;
