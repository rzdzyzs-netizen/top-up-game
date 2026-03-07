import { NextResponse } from "next/server";
const midtransClient = require("midtrans-client");

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

export async function POST(req) {
  try {
    const { orderId, amount, game, userId, packageName } = await req.json();

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: userId,
        email: "customer@topupgame.com",
      },
      item_details: [
        {
          id: orderId,
          price: amount,
          quantity: 1,
          name: `${game} - ${packageName}`,
        },
      ],
    };

    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({ token: transaction.token, redirect_url: transaction.redirect_url });
  } catch (error) {
    console.error("Midtrans error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}