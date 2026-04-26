from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

    try:
        data = request.get_json()
        transaksi = data.get('total_transaksi', 0)
        # Kita pakai lama_bergabung hanya sebagai pendukung, bukan penghambat
        lama_bergabung = data.get('lama_bergabung', 0)

        # LOGIKA YANG DISINKRONKAN DENGAN TABEL MANAGEMENT:
        # 1. Platinum: Transaksi di atas 1 Juta (Asumsi > 25 porsi)
        if transaksi >= 1000000:
            label_nama = "Platinum"
        
        # 2. Gold: Transaksi di atas 420rb (Sesuai kriteria 12 porsi kamu)
        elif transaksi >= 420000:
            label_nama = "Gold"
            
        # 3. Silver: Transaksi di atas 175rb (Sesuai kriteria 5 porsi kamu)
        elif transaksi >= 175000:
            label_nama = "Silver"
            
        # 4. Sisanya Classic
        else:
            label_nama = "Classic"

        return jsonify({
            "success": True,
            "label_nama": label_nama
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)