from flask import Blueprint, jsonify, request
import sqlite3

payment_bp = Blueprint("payment", __name__)

@payment_bp.route("/api/orders", methods=["POST"])
def create_order():
    data = request.get_json()

    conn = sqlite3.connect("database.db")
    c = conn.cursor()

    c.execute("""
        INSERT INTO orders (order_id, game, user_id, package, price, method, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data["order_id"],
        data["game"],
        data["user_id"],
        data["package"],
        data["price"],
        data["method"],
        data["status"]
    ))

    conn.commit()
    conn.close()

    return jsonify({"success": True, "order_id": data["order_id"]})