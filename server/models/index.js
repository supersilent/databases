var db = require('../db').dbConnection;
const Promise = require('bluebird');
db.queryAsync = Promise.promisify(db.query);

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};
var headers = defaultCorsHeaders;
headers['Content-Type'] = 'application/json';

module.exports = {
  messages: {
    get: function(req, res) {

      // SELECT messages.text,users.username,rooms.roomname  FROM messages,rooms,users where messages.room_id=rooms.room_id and messages.user_id=users.user_id
      const messagesSelectQuery = `SELECT messages.text, users.username, rooms.roomname, messages.message_id FROM 
                                  messages, rooms, users WHERE messages.room_id = rooms.room_id
                                  AND messages.user_id = users.user_id`;
      // this function queries the database to return all messages
      db.queryAsync(messagesSelectQuery)
        .then(result => {
          res.writeHead(201, headers);
          res.end(JSON.stringify(result));
        });

      


    }, // a function which produces all the messages
    post: function(req, res) {
      // PROMISE FOR USERNAME
      const escapedUsername = db.escape(req.body.username);
      const userInsertQuery = `INSERT users (username) VALUES (${escapedUsername})`;
      const userSelectQuery = `SELECT user_id FROM users WHERE users.username = ${escapedUsername}`;

      const userPromise = db
        .queryAsync(userInsertQuery)
        .then(result => {
          return result.insertId;
        })
        .catch(err => {
          if (err.errno === 1062) {
            // check if duplication error
            return db.queryAsync(userSelectQuery).then(result => {
              return result[0].user_id;
            });
          }
        });

      const escapedRoomname = db.escape(req.body.roomname);
      const roomInsertQuery = `INSERT rooms (roomname) VALUES (${escapedRoomname})`;
      const roomSelectQuery = `SELECT room_id FROM rooms WHERE rooms.roomname = ${escapedRoomname}`;

      const roomPromise = db
        .queryAsync(roomInsertQuery)
        .then(result => {
          return result.insertId;
        })
        .catch(err => {
          if (err.errno === 1062) {
            return db.queryAsync(roomSelectQuery).then(result => {
              return result[0].room_id;
            });
          }
        });

      Promise.all([userPromise, roomPromise]).then(result => {
        
        // First escape the message
        const escapedMessage = db.escape(req.body.message);
        console.log(req.body, '#############');
        // create the query string
        const messageInsertionQuery = `INSERT INTO messages (text, room_id, user_id) VALUES (${escapedMessage}, ${result[1]}, ${result[0]})`;
        db.queryAsync(messageInsertionQuery)
          .then(result => {
            let responseObj = req.body;
            // eslint-disable-next-line camelcase
            responseObj.message_id = result.insertId;
            res.writeHead(200, headers);
            res.end(JSON.stringify(responseObj));
          }).catch(err => {
            res.writeHead(400, headers);
            res.end(JSON.stringify(req.body));
            console.log(err);
          });
        // execute the query


        // write code that submits the messages into the database
        // result will be an array of [userID , roomID]
      });
    } // a function which can be used to insert a message into the database

  },

  users: {
    // Ditto as above.
    get: function() {},
    post: function(req, res) {
      // req.body will give us the username
      const escapedUsername = db.escape(req.body.username);
      const userInsertQuery = `INSERT users (username) VALUES(${escapedUsername})`;
      db.query(userInsertQuery, (err, result) => {
        if (err) {
          console.log('Duplicate Error');
          res.end();
        } else {
          console.log(result);
          res.end();
        }
      });
    }
  }
};
