from flask import Flask
from app.routes.api_routes import api
from app.api.login import log_in
from app.routes.web_routes import web
from app.routes.kakutei_routes import kakutei
from app.services.db_init import init_login_db  # ← 여기 추가


def create_app():
    app = Flask(__name__, static_folder='../static')
    app.register_blueprint(web)
    app.register_blueprint(log_in)
    app.register_blueprint(api)
    app.register_blueprint(kakutei)

    init_login_db() 

    return app