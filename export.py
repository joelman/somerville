#!/usr/local/bin/python3

import sqlite3
import json

db = sqlite3.connect('somerville.db3', isolation_level=None)

fields = [
    'PARCEL ID', 'HOUSE NO', 'STREET', 'UNIT', 'PCC DESCRIPT', 'COMMITMENT OWNER', 'CURRENT CO-OWNER',
    'OWNER ADD', 'OWNER CITY', 'OWNER STATE', 'OWNER ZIP', 'SALE PRICE', 'PARCEL VAL', 'LAND VAL',
    'IMPROVE VAL','SQFT', 'STYLE DESCRIP', 'STORIES', 'WALL TYPE 1', 'WALL TYPE 2',
    'HEAT TYPE', 'FUEL TYPE', 'AC TYPE', 'GROSS AREA', 'LIVING AREA', 'ROOMS',
    'BEDROOM', 'BATH', 'BATH DESCRIP', 'KITCHEN DESCRIP',
    'PERCENT GOOD', 'GRADE DESCRIP', 'YEAR', 'RESX FLAG', 'ZONE DESP', 'EXEMPT AMT', 'TAX VALUE',
    'lat', 'lon'
];

db.row_factory = sqlite3.Row
c = db.cursor()

addresses = []
sql = 'select sum([sale price]) price, sum([parcel val]) value, [HOUSE NO], [STREET], [ZONE DESP], lat, lon from property p where [fiscal_year] = (select max([fiscal_year]) from property where [parcel id] = p.[parcel id]) and street <> 0 and lat is not null group by [house no], [street], [zone desp], lat, lon order by [street], [HOUSE NO]'

c.execute(sql)
for row in c.fetchall():
    line = '%s\t%s\t%s\t%s\t%s\t%s\t%s' % (row['price'], row['value'], row['HOUSE NO'], row['STREET'], row['ZONE DESP'], row['lat'], row['lon'])
    addresses.append(line);
    
with open('javascript/addresses.js', 'w') as outfile:
    outfile.write('const addressRows = ["' + "\",\r\n\"".join(addresses) + '"]\r\n') 

formatted = '[' + '], ['.join(fields) + ']'

properties = []
c.execute('select ' + formatted + ' from property p where [fiscal_year] = (select max([fiscal_year]) from property where [parcel id] = p.[parcel id]) order by [street], [HOUSE NO]')
for row in c.fetchall():
    line = '''\t'''.join(str(x) for x in row).replace('"', '\\"')
    properties.append(line)

with open('javascript/properties.js', 'w') as outfile:
    outfile.write('const fields = ["' + "\", \"".join(fields) + '"]\r\n') 
    outfile.write('const propertyRows = ["' + '\",\r\n\"'.join(properties) + '\"]\r\n')
