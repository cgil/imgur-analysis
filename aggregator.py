import json
from pymongo import MongoClient

#	Aggregates and processes mongodb data to later use in visualizations and graphs


def main():
	pass

client = MongoClient()
db = client.imgur
hits = db.hits
main()