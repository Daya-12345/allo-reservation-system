import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create Warehouses
  const mumbaiWarehouse = await prisma.warehouse.create({
    data: {
      name: "Mumbai Warehouse",
      location: "Mumbai",
    },
  });

  const bangaloreWarehouse = await prisma.warehouse.create({
    data: {
      name: "Bangalore Warehouse",
      location: "Bangalore",
    },
  });

  // Create Products
  const iphone = await prisma.product.create({
    data: {
      name: "iPhone 15",
      description: "Apple smartphone",
    },
  });

  const samsung = await prisma.product.create({
    data: {
      name: "Samsung Galaxy S24",
      description: "Samsung flagship smartphone",
    },
  });

  const airpods = await prisma.product.create({
    data: {
      name: "AirPods Pro",
      description: "Apple wireless earbuds",
    },
  });

  // Create Inventory
  await prisma.inventory.createMany({
    data: [
      {
        productId: iphone.id,
        warehouseId: mumbaiWarehouse.id,
        totalStock: 10,
      },
      {
        productId: iphone.id,
        warehouseId: bangaloreWarehouse.id,
        totalStock: 5,
      },
      {
        productId: samsung.id,
        warehouseId: mumbaiWarehouse.id,
        totalStock: 7,
      },
      {
        productId: samsung.id,
        warehouseId: bangaloreWarehouse.id,
        totalStock: 3,
      },
      {
        productId: airpods.id,
        warehouseId: mumbaiWarehouse.id,
        totalStock: 15,
      },
      {
        productId: airpods.id,
        warehouseId: bangaloreWarehouse.id,
        totalStock: 8,
      },
    ],
  });

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });