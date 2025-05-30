from flask import Blueprint, request, send_file
from app.services.kakutei_analyzer import analyze_kakutei_xml

kakutei = Blueprint("kakutei", __name__)

@kakutei.route('/kakutei', methods=['POST'])
def kakutei_route():
    files = request.files.getlist('files')
    analyze_list = [f for f in files if f.filename.lower().endswith('.xml')]
    excel_stream = analyze_kakutei_xml(analyze_list)
    return send_file(excel_stream, as_attachment=True, download_name="analyze_data.xlsx",
                     mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
