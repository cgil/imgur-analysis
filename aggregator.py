import datetime

#	Aggregates and processes mongodb data to later use in visualizations and graphs

#	Aggregate by a time operator
def timeOperator(counter, data, keys, op):
	try:
		timestamp = recursiveGet(data, keys)
		time = formatTimeStamp(timestamp)
		if op == 'weekday':
			index = time.weekday()
		else:
			index = getattr(time, op)
		counter[index] += 1
	except:
		pass
	return counter

#	Dig into nested dictionary for given keys
def recursiveGet(d, keys):
	try:
	    if len(keys) == 1:
	        return d[keys[0]]
	    return recursiveGet(d[keys[0]], keys[1:])
	except:
		return False

#	Format string timestamp to datetime
def formatTimeStamp(timeStamp):
	try:
		return datetime.datetime.strptime(timeStamp, "%Y-%m-%d %H:%M:%S")
	except:
		return timeStamp