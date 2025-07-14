from pymongo import MongoClient
import certifi

MONGO_URI = 'mongodb+srv://wellingtonlimaDevPython:Qazujm%401092@nomesteste.ssgjimc.mongodb.net/'
client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())

db = client['nomesTeste']

nomes_collection = db['nomes']

def sincronizar(nome:str):
  if not nome:
        return {"erro": "Nome vazio"}

  nomes_collection.insert_one({"nome": nome})
  return {"mensagem": "Nome sincronizado com sucesso"}
