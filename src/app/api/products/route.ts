import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventories: {
          include: {
            warehouse: true,
          },
          orderBy: {
            warehouse: {
              name: "asc",
            },
          },
        },
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}