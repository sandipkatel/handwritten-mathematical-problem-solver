from flask import Flask, jsonify
from flask_cors import CORS

# app instance
app = Flask(__name__)
CORS(app)

# /
@app.route("/", methods=["GET", "POST"])
def return_home():
    return jsonify(
    {
        "message": "Welcome to the home page!",
        "people": ["Sandip", "Saphal", "Sharad", "sijan"],
    }
    )

if __name__ == "__main__":
    app.run(debug=True, port=8080)