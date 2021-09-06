import sqlite3

from twisted.internet.protocol import DatagramProtocol
from twisted.internet import reactor

con = sqlite3.connect('db.sqlite3')
cur = con.cursor()

class Server(DatagramProtocol):
    def datagramReceived(self, data, addr):
        data_str = data.decode('utf-8')
        print(f"Received data from {addr}:\n\t{data_str}")
        location = data_str.split(",")

        cur.execute('SELECT id FROM locations_location')

        ids = [idset[0] for idset in cur.fetchall()]
        if ids:
            newid = ids[-1] + 1
        else:
            newid = 1

        cur.execute(f"INSERT INTO locations_location VALUES ('{newid}', '{location[0]}', '{location[1]}', '{location[2]}', '{location[3]}')")
        con.commit()


reactor.listenUDP(3001, Server())
print("Listening on 0.0.0.0:3001")
reactor.run()