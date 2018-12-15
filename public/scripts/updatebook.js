
'use strict';

$('form').css('display','none');

console.log('update: ',$('p[name="update"]'));
console.log('delete: ',$('p[name="delete"]'));

$('p[name="update"]').on('click', function(event) {
  event.preventDefault();

  let liGrab = $(this).parent();

  $('li div img')
  
  let image = (liGrab.find('[name="image"]')[0].src); // image URL
  let title = (liGrab.find('[name="title"]')[0].textContent); // title
  let authors = (liGrab.find('[name="authors"]')[0].textContent); // authors
  let summary = (liGrab.find('[name="summary"]')[0].textContent); // summary
  let isbn = (liGrab.find('[name="isbn"]')[0].textContent); // isbn
  let bookshelf = (liGrab.find('[name="bookshelf"]')[0].textContent); // isbn
  let book_id = (liGrab.find('[name="book_id"]').attr("id")); // book_id

  $('form').attr('action', `/update/${book_id}`);

  $('form input[name="title"]').val(title);
  $('form input[name="authors"]').val(authors);
  $('form input[name="isbn"]').val(isbn);
  $('form input[name="image"]').val(image);
  $('form textarea').val(summary);
  $('form input[name="bookshelf"]').val(bookshelf);
  liGrab.css('display','none');
  $('form').css('display','block');
})

