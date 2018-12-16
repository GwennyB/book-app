
$('.hamburger').on('click', function(event) {
  event.preventDefault();
  console.log($('.hamburger'));
  console.log($('.nav'));
  $('.hamburger').addClass("hidden");
  $('nav').removeClass("hidden");
  $('nav').addClass("show");
})

$('.nav>ul>li').on('click', function(event) {
  event.preventDefault();
  $('.hamburger').addClass("show");
  $('nav').removeClass("show");
  $('nav').addClass("hidden");
})
