import MySQLdb, sys

from twisted.internet.protocol import DatagramProtocol
from twisted.internet import reactor
from decouple import config
from datetime import datetime, timezone

def connect_db():
    con = MySQLdb.connect(
        host=config("DB_HOST"),
        user=config("DB_USER"),
        passwd=config("DB_PASS"),
        db=config("DB_NAME"),
    )
    cur = con.cursor()
    return [con, cur]

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
        timestamp = datetime.fromtimestamp(location[2], timezone.utc)

        con, cur = connect_db()
        
        cur.execute('SELECT id FROM locations_location')

        ids = [idset[0] for idset in cur.fetchall()]
        if ids:
            newid = ids[-1] + 1
        else:
            newid = 1

        cur.execute(f"INSERT INTO locations_location VALUES ('{newid}', '{location[0]}', '{location[1]}', '{location[2]}')")
        con.commit()
        cur.close()
        con.close()


reactor.listenUDP(port, Server())
print(f"Listening on 0.0.0.0:{port}")
reactor.run()