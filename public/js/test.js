$("textarea.autosize").on('keydown keyup', function () {
  $(this).height(1).height( $(this).prop('scrollHeight') );
});




$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});


$(function(){
	$(".btn1 ").on("click", function() {
		var ts=$(.t2);
		focus(ts).ts.css("font-weight","bold");
	});
});


$(function(){
	$(".btn1").on("click", function() {
		var ts=$(.t2);
		focus(ts).ts.css("font-weight","bold");
	});
});
