from pymongo import MongoClient
from app.configs import Config
import certifi

client = MongoClient(Config.MONGO_URI, tlsCAFile=certifi.where())

db = client['nomesTeste']

nomes_collection = db['nomes']

def sincronizar(nome:str):
  if not nome:
        return {"erro": "Nome vazio"}

  nomes_collection.insert_one({"nome": nome})
  return {"mensagem": "Nome sincronizado com sucesso"}
