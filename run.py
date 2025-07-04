from app import create_app

def executar():
    app = create_app()
    app.run(debug=False)

if __name__ == "__main__":
    executar()
