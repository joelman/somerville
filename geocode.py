#!/usr/local/bin/python3

import sqlite3
import urllib.request
import json
import time

import multiprocessing
from multiprocessing import Pool

db = sqlite3.connect('somerville.db3', isolation_level=None)

seen = []

c = db.cursor()
c.execute('select distinct [house no], [street] from property where lat is null and [house no] <> 0')
for row in c.fetchall():

    addressurl = 'https://nominatim.openstreetmap.org/search?street=%s+%s&city=Somerville&state=MA&format=json' % (row)
    addressurl = addressurl.replace(' ', '+')
    with urllib.request.urlopen(addressurl) as url:
        data = json.loads(url.read().decode())
        if len(data) == 0:
            continue

        data = data[0]
        lat = data['lat']
        lon = data['lon']
        
        sql = 'update property set lat = ?, lon = ? where [house no] = ? and street = ?'
        insert = (lat, lon, row[0], row[1])
        print(insert)
        c.execute(sql, insert)

        time.sleep(1)
