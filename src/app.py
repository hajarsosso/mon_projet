from flask import Flask
app = Flask(__name__)

@app.route('/')
def home():
    return '<h1>Calculator API</h1><p>Use /add/2/3 to test</p>'

@app.route('/add/<int:a>/<int:b>')
def add(a, b):
    return f'<h2>{a} + {b} = {a + b}</h2>'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
