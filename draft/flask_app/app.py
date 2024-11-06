from flask import Flask, render_template, jsonify
from mail_filter import exctract_data_from_email


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_strings')
def get_strings():
    f = open("mail.txt", "r")
    print(f.read())
    poste = "Bonjour"
    entreprise = "Monde"
    # exctract_data_from_email(email_body)
    return (exctract_data_from_email(f.read()))
    # return jsonify(exctract_data_from_email(email_body))
    return jsonify({"poste": poste, "entreprise": entreprise})
    
if __name__ == '__main__':
    app.run(debug=True)
