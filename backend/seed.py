import sqlite3

conn = sqlite3.connect("database.db")
c = conn.cursor()

# HAPUS semua data lama dulu sebelum insert
# Ini mencegah data double kalau seed.py dijalanin berkali-kali
c.execute("DELETE FROM games")

games = [
    ("Genshin Impact", "genshin.png"),
    ("Roblox", "roblox.png"),
    ("Point Blank", "pb.png"),
    ("Delta Force", "deltaforce.png"),
    ("Free Fire","ff.png"),
    ("Mobile Legend","ml.png"),
    ("Pubg Mobile","pubg.png"),
]

c.executemany("INSERT INTO games (name, image) VALUES (?, ?)", games)

conn.commit()
conn.close()

print("Game masuk.")