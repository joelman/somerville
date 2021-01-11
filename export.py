#!/usr/local/bin/python3

import sqlite3
import json

db = sqlite3.connect('somerville.db3', isolation_level=None)

fields = [
    'PARCEL ID', 'HOUSE NO', 'STREET', 'PCC DESCRIPT', 'COMMITMENT OWNER', 'CURRENT CO-OWNER',
    'OWNER ADD', 'OWNER CITY', 'OWNER STATE', 'OWNER ZIP', 'SALE PRICE', 'PARCEL VAL', 'LAND VAL',
    'IMPROVE VAL','SQFT', 'STYLE DESCRIP', 'STORIES', 'WALL TYPE 1', 'WALL TYPE 2',
    'HEAT TYPE', 'FUEL TYPE', 'AC TYPE', 'GROSS AREA', 'LIVING AREA', 'ROOMS',
    'BEDROOM', 'BATH', 'BATH DESCRIP', 'KITCHEN DESCRIP',
    'PERCENT GOOD', 'GRADE DESCRIP', 'YEAR', 'RESX FLAG', 'ZONE DESP', 'EXEMPT AMT', 'TAX VALUE'
];

db.row_factory = sqlite3.Row
c = db.cursor()

addresses = []
c.execute('select distinct [HOUSE NO], [STREET], lat, lon from property order by [street], [HOUSE NO]')
for row in c.fetchall():
    line = '%s\t%s' % (row['HOUSE NO'], row['STREET'])
    addresses.append(line);
    
with open('javascript/addresses.js', 'w') as outfile:
    outfile.write('const addressRows = ["' + "\",\r\n\"".join(addresses) + '"]\r\n') 

formatted = '[' + '], ['.join(fields) + ']'

properties = []
c.execute('select ' + formatted + 'from property order by [street], [HOUSE NO]')
for row in c.fetchall():
    line = '''\t'''.join(str(x) for x in row).replace('"', '\\"')
    properties.append(line)

with open('javascript/properties.js', 'w') as outfile:
    outfile.write('const fields = ["' + "\", \"".join(fields) + '"]\r\n') 
    outfile.write('const propertyRows = ["' + '\",\r\n\"'.join(properties) + '\"]\r\n')
