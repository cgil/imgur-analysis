import urllib2
import json
from pymongo import MongoClient
import aggregator
import datetime
import logging

#	Runs backwards through imgur gallery pulling every gallery page
#	Using gallery page pulls every image 'hit.json' with all available information for that image post including comments
#	Stores hit data into a setup mongodb collection: imgur.hits


class Scraper(object):
	def __init__(self):
		self.imgCounter 	= aggregator.Aggregator('image')
		self.capCounter 	= aggregator.Aggregator('captions')
		self.failedPages 	= set()		#	Pages to retry

	#	Aggregate data from ingur from start to end date
	def processPages(self, start=1, end=1154):
		startTimer = datetime.datetime.now()
		for i in xrange(start, end+1):
			self.aggregatePage(i)

		timeDiff = datetime.datetime.now() - startTimer
		logging.info('Finished aggregator in ' + str(timeDiff.seconds) + ' seconds')
		print('Finished aggregator in ' + str(timeDiff.seconds))

	def aggregatePage(self, num):
		page = self.getImgurPage(num)
		if not page:
			logging.warning('Could not open page #' + str(num))
			self.failedPages.add(num)
			continue
		for p in page:
			hit = self.getImgurHit(p['hash'])
			if not hit:
				logging.warning('Could not load hit with hash: ' + p['hash'] + ' in page #' + str(num))
				continue
			#	--time
			imgDatetime = aggregator.findDatetime(hit, ['image', 'timestamp'])
			self.imgCounter.updateSnapshots(hit['image'])
			if 'captions' in hit:
				for cap in hit['captions']:
					#	--time
					capDatetime = aggregator.findDatetime(cap, ['datetime'])
					self.capCounter.updateSnapshots(cap)
					try:
						timeDelta = capDatetime-imgDatetime
						self.capCounter.updateDeltas(cap, timeDelta)
					except:
						logging.exception('Could not update Deltas for caption with page ' + str(num) +' hash: ' + cap['hash'] + ' id: ' + cap['id'])
						pass
		self.imgCounter.storeAll()
		self.capCounter.storeAll()

	#	Loads a hit from a page
	def getImgurHit(self, hash):
		try:
			hitResp = urllib2.urlopen('http://imgur.com/gallery/' + hash + '/comment/best/hit.json')
			return json.load(hitResp)['data']
		except:
			logging.exception('Failed to load hit: ' + hash)
			return False

	#	Loads a page from imgur
	def getImgurPage(self, page):	# 1154 = max = Jan 2, 2011
		try:
			daysAgo = str(page)	# 1 = today, 2 = yesterday...
			galleryResp = urllib2.urlopen('http://imgur.com/gallery/hot/viral/page/' + daysAgo + '/hit.json')
			return json.load(galleryResp)['data']
		except:
			logging.exception('Failed to load Page #' + str(page))
			return False

	#	Stores imgur data - loop runs through 1154 pages (one page per day of existance)
	def storeImgurData(self):
		#Open mongo client and db
		client = MongoClient()
		db = client.imgur
		for i in xrange(1,1155):
			page = self.getImgurPage(i)
			if not page:
				continue
			self.storeImgurHit(db, page, i)
			logging.info('Scraped page #' + str(i))
		
	#	Loads and stores a hit to mongo
	def storeImgurHit(self, db, page, num):
		hits = db.testHits
		for p in page:
			try:
				hitResp = urllib2.urlopen('http://imgur.com/gallery/'+ p['hash'] + '/comment/best/hit.json')
				hitData = json.load(hitResp) 
				hits.insert(hitData)
			except:
				logging.exception('Failed to insert a hit from page #' + str(num))
				continue

	#	Insert data to given collection
	def insertData(self, data, collection):
		collection.insert(data)

scraper = Scraper()
scraper.processPages(1, 1)




