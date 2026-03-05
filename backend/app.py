from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/")
def home():
    return jsonify({"status": "OK", "message": "Backend Top Up Game jalan"})

@app.route("/api/games")
def get_games():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT id, name, image FROM games")
    rows = c.fetchall()
    conn.close()
    games = [{"id": row[0], "name": row[1], "image": row[2]} for row in rows]
    return jsonify(games)

@app.route("/api/orders", methods=["POST"])
def create_order():
    data = request.get_json()
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        INSERT INTO orders (order_id, game, user_id, package, price, method, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data["order_id"], data["game"], data["user_id"],
        data["package"], data["price"], data["method"], data["status"]
    ))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "order_id": data["order_id"]})

if __name__ == "__main__":
    # Render kasih PORT dari environment variable
    # Kalau gak ada (misal di lokal), pake 5000
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)