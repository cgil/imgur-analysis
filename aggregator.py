from pymongo import MongoClient
from pprint import pprint

#	Aggregates and processes mongodb data to later use in visualizations and graphs


def main():
	aggr = hits.aggregate([
		{
			'$project' : {
				'timestamp' : '$data.image.timestamp', 
				'hour' : { '$hour' : '$data.image.timestamp' }
			}
		}
		# ,
		# { 
		# 	'$group' : { 
		# 		'_id': { 'hour' : 1 }, 
		# 		'count' : { '$sum' : 1 }
		# 	} 
		# }
	])
	pprint(aggr)


client = MongoClient()
db = client.imgur
hits = db.testHits
main()