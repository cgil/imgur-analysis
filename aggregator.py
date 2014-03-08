import datetime
import math
import sys
import jsonpickle

#	Aggregates and processes mongodb data to later use in visualizations and graphs

class Snapshot(object):
	def __init__(self, index):
		self.index 		= index
		self.counter 	= 0
		self.ups 		= 0
		self.downs 		= 0
		self.points 	= 0

	def update(self, data):
		self.counter 	+= 1
		self.ups 		+= num(data['ups'], 'int')
		self.downs 		+= num(data['downs'], 'int')
		self.points 	+= num(data['points'], 'int')

	def __toJSON(self):
		return jsonpickle.encode(self)

	def store(self):
		print(self.__toJSON())
		# db[index].save(__toJSON())

class ImageShot(Snapshot):
	def __init__(self, index):
		super(ImageShot, self).__init__(self, index)
		self.startingScore 	= 0
		self.score 			= 0
		self.virality		= 0
		self.views			= 0
		self.animated 		= 0
		self.nsfw 			= 0
		self.reddit 		= 0

	def update(self, data):
		super(ImageShot, self).update(data)

		self.startingScore 	+= num(data['starting_score'], 'int')
		self.score 			+= num(data['score'], 'int')
		self.virality 		+= num(data['virality'], 'float')
		self.views 			+= num(data['views'], 'int')

		if 'animated' in data and data['animated']:
			self.animated += 1
		if 'nsfw' in data and data['nsfw']:
			self.nsfw += 1
		if 'reddit' in data and data['reddit']:
			self.reddit += 1


class CaptionShot(Snapshot):
	def __init__(self, index):
		super(CaptionShot, self).__init__(self, index)
		self.bestScore 	= 0

	def update(self, data):
		self.counter 		+= 1
		self.ups 			+= num(data['ups'], 'int')
		self.downs 			+= num(data['downs'], 'int')
		self.points 		+= num(data['points'], 'int')
		self.bestScore 		+= num(data['best_score'], 'float')


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
			if time.hour in self.hour:
				self.hour[time.hour].update(data)
			else:
				self.hour[time.hour] = self.__initSnapshot(data, 'hour-' + time.hour)
			if time.weekday() in self.weekday:
				self.weekday[time.weekday()].update(data)
			else:
				self.weekday[time.weekday()] = self.__initSnapshot(data, 'weekday-' + time.weekday())
			if time.month in self.month:
				self.month[time.month].update(data)
			else:
				self.month[time.month] = self.__initSnapshot(data, 'month-' + time.month)
			if time.year in self.year:
				self.year[time.year].update(data)
			else:
				self.year[time.year] = self.__initSnapshot(data, 'year-' + time.year)
		except:
			print 'Error in updateSnapshots' + sys.exc_info()[0]
			pass

	def __initSnapshot(self, data, index):
		if self.stype == 'image':
			snap = ImageShot(index)
		else:
			snap = CaptionShot(index)
		snap.update(data)
		return snap

	def updateDeltas(self, data, timeDelta):
		minutes = timeDelta.total_seconds() / 60
		try:
			index = num(math.floor(minutes / 30), 'int')
		except:	#	Errors: index -1
			index = -1
		if index > 47:	# 24 hours+ grouped together
			index = 47
		if index in self.delta:
			self.delta[index].update(data)
		else:
			self.delta[index] = self.__initSnapshot(data, 'delta-' + index)

	#	Get the timestamp from given data
	def getTimestamp(self, data):
		if self.stype == "image":
			return formatTimestamp(data['timestamp'])
		else:
			return formatTimestamp(data['datetime'])

#	Convert to int or float: return 0 on failure
def num(s, nType):
	if nType == 'int':
	    try:
	        return int(s)
	    except:
	        return 0
	else:
		try:
			return float(s)
		except:
			return 0


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

