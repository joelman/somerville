#!/usr/local/bin/python3

import sqlite3
import json

db = sqlite3.connect('somerville.db3', isolation_level=None)

fields = [
    'PARCEL ID', 'HOUSE NO', 'STREET', 'PCC DESCRIPT', 'COMMITMENT OWNER', 'CURRENT CO-OWNER',
    'OWNER ADD', 'OWNER CITY', 'OWNER STATE', 'OWNER ZIP', 'SALE PRICE', 'PARCEL VAL', 'LAND VAL', 'IMPROVE VAL',
    'SQFT', 'STYLE DESCRIP', 'STORIES', 'WALL TYPE 1', 'WALL TYPE 2', 'HEAT TYPE', 'FUEL TYPE', 'AC TYPE',
    'GROSS AREA', 'LIVING AREA', 'ROOMS', 'BEDROOM', 'BATH', 'BATH DESCRIP', 'KITCHEN DESCRIP',
    'PERCENT GOOD', 'GRADE DESCRIP', 'YEAR', 'RESX FLAG', 'ZONE DESP', 'EXEMPT AMT', 'TAX VALUE',
    'lat', 'lon', 'zip'
];

db.row_factory = sqlite3.Row
c = db.cursor()

formatted = '[' + '], ['.join(fields) + ']'

properties = []
c.execute('select ' + formatted + 'from property')
for row in c.fetchall():
    data = dict(row)
    properties.append(data)

with open('javascript/properties.js', 'w') as outfile:
    pstring = json.dumps(properties)
    outfile.write("const properties = " + pstring)
