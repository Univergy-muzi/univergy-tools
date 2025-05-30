from flask import Flask
from app.routes.api_routes import api
from app.routes.web_routes import web
from app.routes.kakutei_routes import kakutei

def create_app():
    app = Flask(__name__, static_folder='../static')
    app.register_blueprint(web)
    app.register_blueprint(api)
    app.register_blueprint(kakutei)
    return app