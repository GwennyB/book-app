-- DROP DATABASE books;
-- CREATE DATABASE books;
\c books;
DROP TABLE bookslist;

CREATE TABLE bookslist (
  id SERIAL PRIMARY KEY,
  authors TEXT,
  title VARCHAR(255),
  isbn VARCHAR(255),
  image VARCHAR(255),
  summary TEXT,
  bookshelf VARCHAR(255)
);


-- INSERT INTO bookslist (authors,title,isbn,image,summary,bookshelf) VALUES ('TEST-author','TEST-title','TEST-isbn','http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg','TEST-summary','TEST-bookshelf');
-- INSERT INTO bookslist (authors,title,isbn,image,summary,bookshelf) VALUES ('TEST2-author','TEST2-title','TEST2-isbn','http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg','TEST2-summary','TEST2-bookshelf');
-- INSERT INTO bookslist (authors,title,isbn,image,summary,bookshelf) VALUES ('TEST3-author','TEST3-title','TEST3-isbn','http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg','TEST3-summary','TEST2-bookshelf');