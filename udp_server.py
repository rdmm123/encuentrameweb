import MySQLdb, sys

from twisted.internet.protocol import DatagramProtocol
from twisted.internet import reactor
from decouple import config
from datetime import datetime

def connect_db(host, user, pwd, db):
    con = MySQLdb.connect(
        host=host,
        user=user,
        passwd=pwd,
        db=db,
    )
    cur = con.cursor()
    return [con, cur]

def add_data(db_info, location):
    host, user, pwd, db = db_info
    con, cur = connect_db(host, user, pwd, db)
        
    cur.execute('SELECT id FROM locations_location')

    ids = [idset[0] for idset in cur.fetchall()]
    if ids:
        newid = ids[-1] + 1
    else:
        newid = 1
    
    timestamp_str = location[2] + " " + location[3]
    cur.execute(f"INSERT INTO locations_location VALUES ('{newid}', '{location[0]}', '{location[1]}', '{timestamp_str}')")
    con.commit()
    cur.close()
    con.close()

port = 3001

if len(sys.argv) > 1 and len(sys.argv) <= 2:
    port = int(sys.argv[1])
elif len(sys.argv) > 2:
    print("Solo se debe especificar el número del puerto.")
    sys.exit()

class Server(DatagramProtocol):
    def datagramReceived(self, data, addr):
        data_str = data.decode('utf-8')
        print(f"Received data from {addr}:\n\t{data_str}")
        location = data_str.split(",")
        add_data([config("MAIN_HOST"), config("MAIN_USER"), config("MAIN_PASS"), config("MAIN_NAME")], location)
        add_data([config("BACKUP_HOST"), config("BACKUP_USER"), config("BACKUP_PASS"), config("BACKUP_NAME")], location)

reactor.listenUDP(port, Server())
print(f"Listening on 0.0.0.0:{port}")
reactor.run()