#!/usr/local/bin/python3

import sqlite3
import urllib.request
import json

import multiprocessing
from multiprocessing import Pool

db = sqlite3.connect('somerville.db3', isolation_level=None)

seen = []

c = db.cursor()
c.execute('select [house no], [street] from property where lat is null and [house no] <> 0')
for row in c.fetchall():

    address = row[0] + ' ' + row[1] + ', Somerville, MA'

    if address in seen:
        print("skipping " + address)
        continue;

    seen.append(address)
    print(address)
    
    address = address.replace(' ', '+')

    addressurl = 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=' + address + '&benchmark=4&format=json'
    with urllib.request.urlopen(addressurl) as url:
        data = json.loads(url.read().decode())

        matches = data['result']['addressMatches']
        if len(matches) == 0:
            print("Unmatched")
            continue;

        if len(matches) > 1:
            print("%s matches found" % len(matches))
        
        m = matches[0]
        lat = m['coordinates']['y']
        lon = m['coordinates']['x']
        zip = m['addressComponents']['zip']

        sql = 'update property set lat = ?, lon = ?, zip = ? where [house no] = ? and street = ?'
        insert = (lat, lon, zip, row[0], row[1])
        print(insert)
        c.execute(sql, insert)
