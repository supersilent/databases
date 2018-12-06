CREATE DATABASE chat;

USE chat;



/* Create other tables and define schemas for them here! */

CREATE TABLE rooms (
  room_id INT AUTO_INCREMENT PRIMARY KEY,
  roomname VARCHAR(30)
);

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30)
);

CREATE TABLE messages (
  /* Describe your table here.*/
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  text VARCHAR(250),
  room_id INT,
  user_id INT,
  FOREIGN KEY (room_id)
    REFERENCES rooms(room_id)
    ON DELETE CASCADE,
  FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);

/*  Execute this file from the command line by typing:
 *    mysql -u root < server/schema.sql
 *  to create the database and the tables.*/

