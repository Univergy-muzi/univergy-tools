from flask import Blueprint, send_from_directory

web = Blueprint("web", __name__)

@web.route("/")
def homepage():
    return open("index.html", encoding="utf-8").read()

@web.route("/static/<path:filename>")
def serve_static(filename):
    return send_from_directory("static", filename)
