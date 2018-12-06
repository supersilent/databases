var db = require("../db").dbConnection;
const Promise = require("bluebird");
db.queryAsync = Promise.promisify(db.query);

module.exports = {
  messages: {
    get: function() {}, // a function which produces all the messages
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
        // create the query string
        const messageInsertionQuery = `INSERT INTO messages (text, room_id, user_id) VALUES (${escapedMessage}, ${result[1]}, ${result[0]})`;
        db.queryAsync(messageInsertionQuery)
          .then(result => {
            console.log(result);
            res.end();
          }).catch(err => {
            res.end();
            console.log(err);
          });
        // execute the query


        // write code that submits the messages into the database
        // result will be an array of [userID , roomID]
      });

      // const escapedMessage = db.escape(req.body.message);
      // const messageInsertQuery = `INSERT messages (text) VALUES (${escapedMessage})`;
      // db.query(messageInsertQuery, (err, result) => {
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     console.log(result);
      //     res.end();
      //   }
      // });
    } // a function which can be used to insert a message into the database

    // ADD TO USER TO DATABASE
    // IF ERROR RETURN USERNAME ID
    // IF NO ERROR RETURN USERNAME ID

    // ADD ROOMNAME TO DATABASE
    // IF ERROR RETURN ROOMNAME ID
    // IF NO ERROR RETURN ROOMNAME ID

    // BECAUSE ABOVE ARE ASYNC WE NEED TO MAKE SURE THAT MESSAGES IS RAN LAST
    // ADD MESSAGES WITH TEXT, ROOMNAME ID, USER ID
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
          console.log("Duplicate Error");
          res.end();
        } else {
          console.log(result);
          res.end();
        }
      });
    }
  }
};
