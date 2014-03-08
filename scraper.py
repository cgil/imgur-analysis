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
	#Open mongo client and db
	client = MongoClient()
	db = client.imgur
	for i in xrange(1,1155):
		page = getImgurPage(i)
		if not page:
			continue
		print '**** Started inserting Page #', i
		storeImgurHit(db, page, i)
		print '**** Finished inserting Page #', i
		log('Scraped page #' + str(i))
		
#	Loads and stores a hit to mongo
def storeImgurHit(db, page, num):
	hits = db.testHits
	for p in page:
		try:
			hitResp = urllib2.urlopen('http://imgur.com/gallery/'+ p['hash'] + '/comment/best/hit.json')
			hitData = json.load(hitResp) 
			hits.insert(hitData)
		except:
			log('Error: Failed to insert a hit from page #' + str(num))
			continue

#	Loads a page from imgur
def getImgurPage(page):	# 1154 = max = Jan 2, 2011
	try:
		daysAgo = str(page)	# 1 = today, 2 = yesterday...
		galleryResp = urllib2.urlopen('http://imgur.com/gallery/hot/viral/page/' + daysAgo + '/hit.json')
		return json.load(galleryResp)['data']
	except:
		log('Error: Failed to load Page #' + str(page))
		return False

#	Loads a hit from a page
def getImgurHit(hash):
	try:
		hitResp = urllib2.urlopen('http://imgur.com/gallery/' + hash + '/comment/best/hit.json')
		return json.load(hitResp)['data']
	except:
		log('Error: Failed to load hit: ' + hash)
		return False

#	Simple error logging to log.txt file
def log(message):
	try:
		with open('log.txt', 'a') as myfile:
			myfile.write(message + ' - ' + str(datetime.now()) + '\n')
	except:
		pass

#	Insert data to given collection
def insertData(data, collection):
	collection.insert(data)

#	Aggregate data from ingur from start to end date
def aggregateData(start=1, end=1154):
	startTimer = datetime.datetime.now()

	imgCounter = aggregator.Aggregator('image')
	capCounter = aggregator.Aggregator('captions')

	for i in xrange(start, end+1):
		page = getImgurPage(i)
		if not page:
			log('Could not open page #' + str(i))
			continue
		for p in page:
			hit = getImgurHit(p['hash'])
			if not hit:
				log('Could not load hit with hash: ' + p['hash'] + ' in page #' + str(i))
				continue
			#	--time
			imgDatetime = aggregator.findDatetime(hit, ['image', 'timestamp'])
			imgCounter.updateSnapshots(hit['image'])
			if 'captions' in hit:
				for cap in hit['captions']:
					#	--time
					capDatetime = aggregator.findDatetime(cap, ['datetime'])
					capCounter.updateSnapshots(cap)
					try:
						timeDelta = capDatetime-imgDatetime
						capCounter.updateDeltas(cap, timeDelta)
					except:
						log('Could not update Deltas for caption with page ' + str(i) +' hash: ' + cap['hash'] + ' id: ' + cap['id'])
						pass

	timeDiff = datetime.datetime.now() - startTimer
	pprint(timeDiff.seconds)

#	Run program
aggregateData(1,1)




