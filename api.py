from flask import Flask, make_response, request, current_app
from datetime import timedelta
from functools import update_wrapper
from pymongo import MongoClient
from bson.json_util import dumps

app = Flask(__name__)

client = MongoClient()
db = client.imgur

def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator

@app.route("/hour/<which>/")
@crossdomain(origin='*')
def hour(which=''):
	return dumps(db['hour'+str(which)].find())

@app.route("/hour/<which>/<shotType>/")
@crossdomain(origin='*')
def hourType(which='', shotType=None):
	if shotType == None:
		query = {}
	else:
		query = { 'shotType' : shotType }
	return dumps(db['hour'+str(which)].find(query))

@app.route("/weekday/<which>/")
@crossdomain(origin='*')
def weekday(which=''):
	return dumps(db['weekday'+str(which)].find())

@app.route("/weekday/<which>/<shotType>/")
@crossdomain(origin='*')
def weekdayType(which='', shotType=None):
	if shotType == None:
		query = {}
	else:
		query = { 'shotType' : shotType }
	return dumps(db['weekday'+str(which)].find(query))

@app.route("/month/<which>/")
@crossdomain(origin='*')
def month(which=''):
	return dumps(db['month'+str(which)].find())

@app.route("/month/<which>/<shotType>/")
@crossdomain(origin='*')
def monthType(which='', shotType=None):
	if shotType == None:
		query = {}
	else:
		query = { 'shotType' : shotType }
	return dumps(db['month'+str(which)].find(query))

@app.route("/year/<which>/")
@crossdomain(origin='*')
def year(which=''):
	return dumps(db['year'+str(which)].find())

@app.route("/year/<which>/<shotType>/")
@crossdomain(origin='*')
def yearType(which='', shotType=None):
	if shotType == None:
		query = {}
	else:
		query = { 'shotType' : shotType }
	return dumps(db['year'+str(which)].find(query))

@app.route("/delta/<which>/")
@crossdomain(origin='*')
def delta(which=''):
	return dumps(db['delta'+str(which)].find())

@app.route("/delta/<which>/<shotType>/")
@crossdomain(origin='*')
def deltaType(which='', shotType=None):
	if shotType == None:
		query = {}
	else:
		query = { 'shotType' : shotType }
	return dumps(db['delta'+str(which)].find(query))

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')