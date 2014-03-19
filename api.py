from flask import Flask
from pymongo import MongoClient

app = Flask(__name__)

client = MongoClient()
db = client.imgur

@app.route("/hour/<which>")
def hour(which=''):
	return db[hour+which].find()

@app.route("/weekday/<which>")
def weekday(which=''):
	return db[weekday+which].find()

@app.route("/month/<which>")
def month(which=''):
	return db[month+which].find()

@app.route("/year/<which>")
def year(which=''):
	return db[year+which].find()

@app.route("/delta/<which>")
def delta(which=''):
	return db[delta+which].find()

if __name__ == "__main__":
    app.run()