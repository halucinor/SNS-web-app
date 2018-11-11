var formData = new FormData($('.cardSave'));
var cardId = 1;
$('.plusCardbtn').on('click', (event) => {
  var formData = new FormData();

  formData.append('card' ,$('#card_edit').html());
  formData.append('cardId', cardId);
  formData.append('subjectId', 'samplesubject');
  formData.append('workId', 'samplework');
  html2canvas($('.card_edit')[0]).then(function(canvas) {
    const thumnailURL = canvas.toDataURL('image/jpg', 1.0); //해상도 문제 해결 필요
    const blob = dataURItoBlob(thumnailURL);
    formData.append('thumnail', blob);
    Card.cardPartDivider('divid-1');
    $.ajax({
        url: '/cardSave',
        type: 'post',
        enctype:"multipart/form-data",
        data: formData,
        processData: false,
        contentType: false,
      })

      .done(function(response) {
       let thumnail = thumnailGeneration(response.linkThumnail);
       // console.log(thumnail);
       $('.thumnaillist').append(thumnail);
      })
      .fail(function(error) {
        // console.log(error);
      })
  });
  cardId++;
});
function thumnailGeneration(thumnailurl){
  let thumnailHtml;
  thumnailHtml = `<a href='#' class = 'thumnailURL'><img class = 'thumnailImg' src = '${thumnailurl}'/></a>`
  return thumnailHtml;
}


function dataURItoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}
//**blob to dataURL**
function blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function(e) {callback(e.target.result)};
    a.readAsDataURL(blob);
}
})()
