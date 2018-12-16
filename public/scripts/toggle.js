$('.hamburger').addClass("show");
$('nav').removeClass("show");
$('nav').addClass("hidden");

$('.hamburger').on('click', function(event) {
  event.preventDefault();
  console.log($('.hamburger'));
  console.log($('.nav'));
  $('.hamburger').addClass("hidden");
  $('nav').removeClass("hidden");
  $('nav').addClass("show");
})

