DROP DATABASE books;
CREATE DATABASE books;
\c books;

CREATE TABLE bookslist (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  isbn VARCHAR(255),
  image VARCHAR(255),
  description TEXT,
  bookshelf VARCHAR(255)
);

INSERT INTO bookslist (author,title,isbn,image,description,bookshelf) VALUES ('TEST-author','TEST-title','TEST-isbn','TEST-image','TEST-description','TEST-bookshelf');