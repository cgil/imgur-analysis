from flask import Flask
from pymongo import MongoClient
from bson.json_util import dumps

app = Flask(__name__)

client = MongoClient()
db = client.imgur

@app.route("/hour/<which>/")
def hour(which=''):
	return dumps(db['hour'+str(which)].find())

@app.route("/hour/<which>/<shotType>")
def hourType(which='', shotType=None):
	if shotType == None:
		query = {}
	else:
		query = { 'shotType' : shotType }
	return dumps(db['hour'+str(which)].find(query))

@app.route("/weekday/<which>")
def weekday(which=''):
	return db['weekday'+str(which)].find()

@app.route("/weekday/<which>/<shotType>")
def weekdayType(which='', shotType=None):
	if shotType == None:
		query = {}
	else:
		query = { 'shotType' : shotType }
	return dumps(db['weekday'+str(which)].find(query))

@app.route("/month/<which>")
def month(which=''):
	return db['month'+str(which)].find()

@app.route("/month/<which>/<shotType>")
def monthType(which='', shotType=None):
	if shotType == None:
		query = {}
	else:
		query = { 'shotType' : shotType }
	return dumps(db['month'+str(which)].find(query))

@app.route("/year/<which>")
def year(which=''):
	return db['year'+str(which)].find()

@app.route("/year/<which>/<shotType>")
def yearType(which='', shotType=None):
	if shotType == None:
		query = {}
	else:
		query = { 'shotType' : shotType }
	return dumps(db['year'+str(which)].find(query))

@app.route("/delta/<which>")
def delta(which=''):
	return db['delta'+str(which)].find()

@app.route("/delta/<which>/<shotType>")
def deltaType(which='', shotType=None):
	if shotType == None:
		query = {}
	else:
		query = { 'shotType' : shotType }
	return dumps(db['delta'+str(which)].find(query))

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')