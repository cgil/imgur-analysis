import urllib2
import json
from pymongo import MongoClient
import aggregator
from pprint import pprint
import datetime

#	Runs backwards through imgur gallery pulling every gallery page
#	Using gallery page pulls every image 'hit.json' with all available information for that image post including comments
#	Stores hit data into a setup mongodb collection: imgur.hits

#	Stores imgur data - loop runs through 1154 pages (one page per day of existance)
def storeImgurData():
	for i in xrange(1,1155):
		page = getImgurPage(i)
		if not page:
			continue
		print "**** Started inserting Page #",i
		storeImgurHit(page, i)
		print "**** Finished inserting Page #",i
		log("Scraped page #"+str(i))
		
#	Loads and stores a hit to mongo
def storeImgurHit(page, num):
	hits = db.testHits
	for p in page:
		try:
			hitResp = urllib2.urlopen('http://imgur.com/gallery/'+ p['hash'] + '/comment/best/hit.json')
			hitData = json.load(hitResp) 
			hits.insert(hitData)
			print "Inserted hit #",hits.count()
		except:
			print "@@@@@@@@@ Error: Failed to insert a hit"
			log("Error: Failed to insert a hit from page #"+str(num))
			continue

#	Loads a page from imgur
def getImgurPage(page):	# 1154 = max = Jan 2, 2011
	try:
		daysAgo = str(page)	# 1 = today, 2 = yesterday...
		galleryResp = urllib2.urlopen('http://imgur.com/gallery/hot/viral/page/' + daysAgo + '/hit.json')
		return json.load(galleryResp)['data']
	except:
		print "@@@@@@@@@ Error: Failed to load Page #", page
		log("Error: Failed to load Page #"+str(page))
		return False

#	Loads a hit from a page
def getImgurHit(hash):
	try:
		hitResp = urllib2.urlopen('http://imgur.com/gallery/'+ hash + '/comment/best/hit.json')
		return json.load(hitResp)['data']
	except:
		pprint("Error: Failed to load hit: " + hash)
		log("Error: Failed to load hit: " + hash)
		return False

#	Simple error logging to log.txt file
def log(message):
	with open("log.txt", "a") as myfile:
		myfile.write(message+"\n")

#	Insert data to given collection
def insertData(data, collection):
	collection.insert(data)

#	Aggregate data from ingur from start to end date
def aggregateData(start=1, end=1154):
	startTimer = datetime.datetime.now()

	imgCounter = aggregator.Aggregator()
	capCounter = aggregator.Aggregator()

	for i in xrange(start, end+1):
		page = getImgurPage(i)
		if not page:
			continue
		for p in page:
			hit = getImgurHit(p['hash'])
			#	--time
			imgDatetime = aggregator.findDatetime(hit, ['image', 'timestamp'])
			imgCounter.updateTimers(imgDatetime)
			imgCounter.updateSnapshot()
			for cap in hit['captions']:
				#	--time
				capDatetime = aggregator.findDatetime(cap, ['datetime'])
				capCounter.updateTimers(capDatetime)
				capCounter.updateDeltas(capDatetime-imgDatetime)

	pprint(vars(capCounter))
	timeDiff = datetime.datetime.now() - startTimer
	pprint(timeDiff.seconds)

#	Open mongo client and db
client = MongoClient()
db = client.imgur

#	Run program
aggregateData(1,1)




