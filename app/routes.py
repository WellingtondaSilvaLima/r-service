from flask import render_template, Blueprint, request, jsonify
from app.models import sincronizar, nomes_collection


main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def home():
    nomes = list(nomes_collection.find({}, {'_id': 0}))

    return render_template("index.html", nomes=nomes)

@main_bp.route("/recebe-sincronizacao", methods=['POST'])
def recebe_sincronizacao():
    try:
        nomes = request.get_json(force=True)
        if not isinstance(nomes, list):
            return jsonify({'err': True, 'msg': 'Formato inválido: esperado uma lista de nomes.'}), 400

        # Pega todos os nomes já salvos no banco
        dados_banco = list(nomes_collection.find({}, {'_id': 0, 'nome': 1}))
        nomes_db = [dado['nome'] for dado in dados_banco]

        # Insere apenas os nomes que ainda não estão no banco
        novos = 0
        for nome in nomes:
            if nome.get('nome') and nome['nome'] not in nomes_db:
                sincronizar(nome['nome'])
                novos += 1

        return jsonify({'msg': 'Sincronização concluída', 'novos_inseridos': novos})

    except Exception as e:
        return jsonify({'err': True, 'msg': f'Erro: {str(e)}'}), 500
    
@main_bp.route('/index.html')
def index_html():
    return render_template('index.html')