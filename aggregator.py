import datetime
import math
#	Aggregates and processes mongodb data to later use in visualizations and graphs

class Snapshot(object):
	def __init__(self, index):
		self.index 		= index
		self.counter 	= 0
		self.ups 		= 0
		self.downs 		= 0
		self.points 	= 0

	def update(self, data):
		self.counter += 1
		self.ups += data['ups']
		self.downs += data['downs']
		self.points += data['points']

class ImageShot(Snapshot):
	def __init__(self):
		super(ImageShot, self).__init__(self)
		self.startingScore 	= 0
		self.score 			= 0
		self.virality		= 0
		self.views			= 0
		self.animated 		= 0
		self.nsfw 			= 0
		self.reddit 		= 0

	def update(self, data):
		super(ImageShot, self).update(data)

		self.startingScore += data['starting_score']
		self.score += data['score']
		self.virality += data['virality']
		self.views += data['views']
		if data['animated']:
			self.animated += 1
		if data['nsfw']:
			self.nsfw += 1
		if data['reddit']:
			self.reddit += 1


class CaptionShot(Snapshot):
	def __init__(self):
		super(CaptionShot, self).__init__(self)
		self.bestScore 	= 0

	def update(self, data):
		self.counter += 1
		self.ups += int(data['ups'])
		self.downs += int(data['downs'])
		self.points += int(data['points'])
		self.bestScore += float(data['best_score'])


class Aggregator(object):
	def __init__(self, stype):
		self.stype 		= stype
		self.hour 		= {}				
		self.weekday 	= {}
		self.month 		= {}
		self.year 		= {}	
		self.delta 		= {}		

	def updateSnapshots(self, data):
		try:
			time = self.getTimestamp(data)
			if self.hour[time.hour]:
				self.hour[time.hour].update(data)
			else:
				self.hour[time.hour] = self.__initSnapshot(data)
			if self.weekday[time.weekday()]:
				self.weekday[time.weekday()].update(data)
			else:
				self.weekday[time.weekday()] = self.__initSnapshot(data)
			if self.month[time.month]:
				self.month[time.month].update(data)
			else:
				self.month[time.month] = self.__initSnapshot(data)
			if self.year[time.year]:
				self.year[time.year].update(data)
			else:
				self.year[time.year] = self.__initSnapshot(data)
		except:
			pass

	def __initSnapshot(self, data):
		if self.stype == 'image':
			snap = ImageShot()
		else:
			snap = CaptionShot()
		snap.update(data)
		return snap

	def updateDeltas(self, data, timeDelta):
		minutes = timeDelta.total_seconds() / 60
		index = int(math.floor(minutes / 30))
		if index > 47:	# 24 hours+ grouped together
			index = 47
		if self.delta[index]:
			self.delta[index].update(data)
		else:
			self.delta[index] = self.__initSnapshot(data)

	#	Get the timestamp from given data
	def getTimestamp(self, data):
		if self.stype == "image":
			return formatTimestamp(data['timestamp'])
		else:
			return formatTimestamp(data['datetime'])


#	Format string timestamp to datetime
def formatTimestamp(time):
	try:
		return datetime.datetime.strptime(time, "%Y-%m-%d %H:%M:%S")
	except:
		return time

#	Dig into nested dictionary for given keys
def recursiveGet(d, keys):
	try:
	    if len(keys) == 1:
	        return d[keys[0]]
	    return recursiveGet(d[keys[0]], keys[1:])
	except:
		return False


#	Finds a date string and converts then returns a datetime
def findDatetime(data, keys):
	try:
		timestamp = recursiveGet(data, keys)
		return formatTimestamp(timestamp)
	except:
		return False

