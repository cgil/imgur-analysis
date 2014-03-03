from pymongo import MongoClient
from pprint import pprint

#	Aggregates and processes mongodb data to later use in visualizations and graphs


def main():
	aggr = hits.aggregate([
		{
			'$project' : {
				'timestamp' : '$data.image.timestamp', 
				'hours' : { '$hour' : '$data.image.timestamp' }
			}
		}
		,
		{ 
			'$group' : { 
				'_id': { 'hour' : '$hours' }, 
				'count' : { '$sum' : 1 }
			} 
		}
		,
		{
			'$sort' : {
				'_id.hour' : 1
			}
		}
	])
	pprint(aggr)
	db.hourAggr.insert(aggr['result'])


client = MongoClient()
db = client.imgur
hits = db.testHits
main()