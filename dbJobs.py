from pymongo import MongoClient
from pprint import pprint
import datetime
from bson.objectid import ObjectId

def main():
	for hit in hits.find():
		log("+Starting _id: " + str(hit['_id']))
		try:
			new = formatTimeStamp(hit['data']['image']['timestamp'])
			if new is not None:
				hits.update({'_id':hit['_id']},{'$set':{'data.image.timestamp': new}},upsert=False, multi=False)
		except:
			log("**Error: hit with _id: " + str(hit['_id']) + " crashed setting *data.image.timestamp")
			pass
		try:
			new = formatTimeStamp(hit['data']['image']['create_datetime'])
			if new is not None:
				hits.update({'_id':hit['_id']},{'$set':{'data.image.create_datetime': new}},upsert=False, multi=False)
		except:
			log("**Error: hit with _id: " + str(hit['_id']) + " crashed setting *data.image.create_datetime")
			pass
		try:
			new = formatTimeStamp(hit['data']['image']['hot_datetime'])
			if new is not None:
				hits.update({'_id':hit['_id']},{'$set':{'data.image.hot_datetime': new}},upsert=False, multi=False)
		except:
			log("**Error: hit with _id: " + str(hit['_id']) + " crashed setting *data.image.hot_datetime")
			pass

		try:
			captions = hit['data']['captions']
			for cap in captions:
				try:
					new = formatTimeStamp(cap['datetime'])
					if new is not None:
						hits.update({'_id':hit['_id'], 'data.captions.id':cap['id']},{'$set':{'data.captions.$.datetime': new}},upsert=False, multi=False)
				except:
					log("**Error: hit with _id: " + str(hit['_id']) + " and cap id: " + str(cap['id']) + " crashed setting *data.captions.$.datetime")
					pass
		except:
			log("***Error: Could not process _id: " + str(hit['_id']))
			continue
		log("-Finished _id: " + str(hit['_id']))


def findHit():
	for hit in hits.find({'_id': ObjectId('5313a9dacbca0516172dcb64')}):
		pprint(hit['data'])
		# count = 1
		# captions = hit['data']['captions']
		# for cap in captions:
		# 	pprint(str(count) + " " + str(cap['datetime']))
		# 	count += 1

#2014-03-01 17:17:40
def formatTimeStamp(timeStamp):
	try:
		return datetime.datetime.strptime(timeStamp, "%Y-%m-%d %H:%M:%S")
	except:
		return timeStamp

def showHits():
	for hit in hits.find():
		old = hit['data']['image']
		pprint(old)

def log(message):
	with open("log.txt", "a") as myfile:
		myfile.write(message+"\n")
		

client = MongoClient()
db = client.imgur
hits = db.hits
main()


