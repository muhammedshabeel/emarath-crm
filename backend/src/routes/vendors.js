const express = require("express");
const prisma = require("../prisma");
const authenticate = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const requireAnyRole = require("../middlewares/requireAnyRole");

const router = express.Router();
router.use(authenticate);

router.get("/", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const vendors = await prisma.vendor.findMany({
    include: { products: true },
    orderBy: { createdAt: "desc" }
  });

  return res.json(vendors);
});

router.post("/", requireRole("ADMIN"), async (req, res) => {
  const { name, contactName, email, phone, status } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Vendor name is required." });
  }

  const vendor = await prisma.vendor.create({
    data: {
      name,
      contactName,
      email,
      phone,
      status: status || "ACTIVE"
    }
  });

  return res.status(201).json(vendor);
});

router.patch("/:id", requireRole("ADMIN"), async (req, res) => {
  const { id } = req.params;
  const { name, contactName, email, phone, status } = req.body;

  const vendor = await prisma.vendor.update({
    where: { id },
    data: {
      name,
      contactName,
      email,
      phone,
      status
    }
  });

  return res.json(vendor);
});

router.get("/:id/products", requireAnyRole(["ADMIN", "AGENT"]), async (req, res) => {
  const { id } = req.params;

  const products = await prisma.vendorProduct.findMany({
    where: { vendorId: id },
    orderBy: { createdAt: "desc" }
  });

  return res.json(products);
});

router.post("/:id/products", requireRole("ADMIN"), async (req, res) => {
  const { id } = req.params;
  const { name, sku, price, description, status } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Product name is required." });
  }

  const product = await prisma.vendorProduct.create({
    data: {
      vendorId: id,
      name,
      sku,
      price,
      description,
      status: status || "ACTIVE"
    }
  });

  return res.status(201).json(product);
});

router.patch("/products/:productId", requireRole("ADMIN"), async (req, res) => {
  const { productId } = req.params;
  const { name, sku, price, description, status } = req.body;

  const product = await prisma.vendorProduct.update({
    where: { id: productId },
    data: {
      name,
      sku,
      price,
      description,
      status
    }
  });

  return res.json(product);
});

module.exports = router;
