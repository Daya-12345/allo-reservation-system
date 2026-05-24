import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: {
        id,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    if (
        reservation.status === "EXPIRED" ||
        reservation.status === "CANCELLED"
    ) {
        return NextResponse.json(
            { message: "Reservation is no longer valid" },
            { status: 409 }
        );
    }

    if (reservation.status === "CONFIRMED") {
        return NextResponse.json(
            { message: "Reservation already confirmed" },
            { status: 409 }
        );
    }

    // BLOCK IF EXPIRED
    if (new Date() > reservation.expiresAt) {
      return NextResponse.json(
        { message: "Reservation expired" },
        { status: 410 }
      );
    }

    // UPDATE INVENTORY FIRST
    await prisma.inventory.updateMany({
      where: {
        productId: reservation.productId,
        warehouseId: reservation.warehouseId,
      },
      data: {

        // REAL PURCHASE HAPPENS HERE
        totalStock: {
          decrement: reservation.quantity,
        },

        // REMOVE RESERVED STOCK
        reservedStock: {
          decrement: reservation.quantity,
        },
      },
    });

    // UPDATE RESERVATION STATUS
    await prisma.reservation.update({
      where: {
        id,
      },
      data: {
        status: "CONFIRMED",
      },
    });

    return NextResponse.json({
      message: "Purchase confirmed",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Error confirming reservation" },
      { status: 500 }
    );
  }
}