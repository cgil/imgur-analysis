import urllib2
import json
from pymongo import MongoClient
import aggregator
import datetime
import logging

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
		storeImgurHit(db, page, i)
		logging.info('Scraped page #' + str(i))
		
#	Loads and stores a hit to mongo
def storeImgurHit(db, page, num):
	hits = db.testHits
	for p in page:
		try:
			hitResp = urllib2.urlopen('http://imgur.com/gallery/'+ p['hash'] + '/comment/best/hit.json')
			hitData = json.load(hitResp) 
			hits.insert(hitData)
		except:
			logging.exception('Failed to insert a hit from page #' + str(num))
			continue

#	Loads a page from imgur
def getImgurPage(page):	# 1154 = max = Jan 2, 2011
	try:
		daysAgo = str(page)	# 1 = today, 2 = yesterday...
		galleryResp = urllib2.urlopen('http://imgur.com/gallery/hot/viral/page/' + daysAgo + '/hit.json')
		return json.load(galleryResp)['data']
	except:
		logging.exception('Failed to load Page #' + str(page))
		return False

#	Loads a hit from a page
def getImgurHit(hash):
	try:
		hitResp = urllib2.urlopen('http://imgur.com/gallery/' + hash + '/comment/best/hit.json')
		return json.load(hitResp)['data']
	except:
		logging.exception('Failed to load hit: ' + hash)
		return False

#	Insert data to given collection
def insertData(data, collection):
	collection.insert(data)

#	Aggregate data from ingur from start to end date
def aggregateData(start=1, end=1154):
	startTimer = datetime.datetime.now()

	imgCounter = aggregator.Aggregator('image')
	capCounter = aggregator.Aggregator('captions')
	failedPages = []

	for i in xrange(start, end+1):
		page = getImgurPage(i)
		if not page:
			logging.warning('Could not open page #' + str(i))
			continue
		for p in page:
			hit = getImgurHit(p['hash'])
			if not hit:
				logging.warning('Could not load hit with hash: ' + p['hash'] + ' in page #' + str(i))
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
						logging.exception('Could not update Deltas for caption with page ' + str(i) +' hash: ' + cap['hash'] + ' id: ' + cap['id'])
						pass
			imgCounter.storeAll()
			capCounter.storeAll()

	timeDiff = datetime.datetime.now() - startTimer
	logging.info('Finished aggregator in ' + str(timeDiff.seconds) + ' seconds')
	print('Finished aggregator in ' + str(timeDiff.seconds))

#	Run program
aggregateData(1,1)




