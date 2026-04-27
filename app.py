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
# LOGIKA YANG DISINKRONKAN DENGAN GAMBAR MANAGEMENT KAMU:
        # 1. Platinum: > 25 porsi (Asumsi transaksi tinggi, misal > 800rb)
        if transaksi >= 875000: 
            label_nama = "Platinum"
            status_loyal = "SANGAT LOYAL"
        
        # 2. Gold: 12 porsi (± Rp 420.000)
        elif transaksi >= 420000:
            label_nama = "Gold"
            status_loyal = "SANGAT LOYAL"
            
        # 3. Silver: 5 porsi (± Rp 175.000) -> 350rb masuk sini!
        elif transaksi >= 175000:
            label_nama = "Silver"
            status_loyal = "LOYAL" # Perubahan di sini: Silver sudah Loyal
            
        # 4. Classic: 1-4 porsi
        else:
            label_nama = "Classic"
            status_loyal = "BELUM LOYAL"

        return jsonify({
            "success": True, 
            "label_nama": label_nama,
            "status_loyal": status_loyal # Kita kirim status loyalnya juga
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run()    