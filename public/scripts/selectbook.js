'use strict';

$('form').css('display','none');
$('p[name="isbn"]').css('display','none');

$('li').on('click', function(event) {
  event.preventDefault();

  let liGrab = $(this).parent();

  let image = (liGrab.find('[name="image"]')[0].src); // image URL
  let title = (liGrab.find('[name="title"]')[0].textContent); // title
  let authors = (liGrab.find('[name="authors"]')[0].textContent); // authors
  let summary = (liGrab.find('[name="summary"]')[0].textContent); // summary
  let isbn = (liGrab.find('[name="isbn"]')[0].textContent); // isbn
  
  $('form input[name="title"]').val(title);
  $('form input[name="authors"]').val(authors);
  $('form input[name="isbn"]').val(isbn);
  $('form input[name="image"]').val(image);
  $('form textarea').val(summary);
  liGrab.css('display','none');
  $('form').css('display','block');
});
