import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // FIND EXPIRED PENDING RESERVATIONS
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    for (const reservation of expiredReservations) {
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

      // MARK EXPIRED
      await prisma.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "EXPIRED",
        },
      });
    }

    return NextResponse.json({
      message: "Cleanup completed",
      expiredCount: expiredReservations.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}