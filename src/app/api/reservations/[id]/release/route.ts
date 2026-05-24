import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // RESTORE INVENTORY
    await prisma.inventory.updateMany({
      where: {
        productId: reservation.productId,
        warehouseId: reservation.warehouseId,
      },
      data: {
        reservedStock: {
          decrement: reservation.quantity,
        },
      },
    });

    // UPDATE STATUS
    await prisma.reservation.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({
      message: "Reservation cancelled successfully",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to cancel reservation" },
      { status: 500 }
    );
  }
}