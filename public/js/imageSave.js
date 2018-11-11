(function(){

  $('.card-editor-wrapper').on('focus', '.part', function(){
    editingpart = $(this);
  });


  $("#imgInput").change(function() {
    readURL(this);
    this.value ='';
    autoThumnailSave();
  });

  $('#backGroundImginput').change(function(){
    readImgURL(this);
    this.value = '';
    autoThumnailSave();
  });

  $('.card-editor-wrapper').on('click', '.close', function(event){
    $(this).parent().empty().attr({
      contenteditable : true
    }).removeClass('imgpart');
    autoThumnailSave();
  });
  $('.card-editor-wrapper').on('change', '#modalImgInput', function(event){
    let thisModal = $(this).parent().parent().prev();

    readImgURL(this, thisModal);
    this.value = '';
  })
  function readURL(input) {
    if (editingpart === undefined) {
      alert('이미지를 업로드할 부분을 선택하세요');
      return;
    }
    $(editingpart).empty();
    $(editingpart).css('display','inline-flex');
    if (input.files && input.files[0]) {
      if(!isImage(input.files[0])){
        alert('이미지 파일을 선택해주세요');
        return;
      }
      var reader = new FileReader();
      reader.readAsDataURL(input.files[0]);
      reader.onload = function(e) {

        let imgData = new FormData();

        const imgBolb = dataURItoBlob(e.target.result);

        imgData.append('cardImg', imgBolb);
        $.ajax({
            url: '/cardImgSave',
            type: 'post',
            enctype: "multipart/form-data",
            data: imgData,
            processData: false,
            contentType: false,
          })
          .done(function(response) {
            var image = document.createElement("img");
            console.log(response);
            imgUrl = response;

            $(image).attr({
              id: 'image',
              src: imgUrl,
            }).css({
              position : 'absolute',
              width: (editingpart.attr('#id') === 'right' || editingpart.attr('#id') === 'left') ? '' : $('.part').width(),
              height: (editingpart.attr('#id') === 'right' || editingpart.attr('#id') === 'left') ? $('.part').height() : '',
            }).draggable({
              axis: (editingpart.attr('#id') === 'right' || editingpart.attr('#id') === 'left') ? 'y' : 'x',
              // containment : $('#dragbarScope'),
            });

            var closeButton = document.createElement('img');

            $(closeButton).attr({
              class : 'close',
              src : './image/close.svg',
            });

            editingpart.attr('contenteditable', 'false');
            $(editingpart).addClass('imgpart');
            $(editingpart).append($(image));
            $(editingpart).append(closeButton);
            editingpart = undefined;
          })
          .fail(function(error) {
            console.log(error);
            alert('이미지 업로드를 실패하였습니다.');
            editingpart = undefined;
          })

      }
    }
  }

  function readImgURL(input, object){

      if (input.files && input.files[0]) {
        var reader = new FileReader();
        if(!isImage(input.files[0])){
          alert('이미지 파일을 선택해주세요');
          return;
        }
        reader.readAsDataURL(input.files[0]);
        reader.onload = function(e) {
          backgroundColor = $('.card-editor').css('background-color');
          let imgData = new FormData();
          const imgBolb = dataURItoBlob(e.target.result);


          imgData.append('cardImg', imgBolb);
          $.ajax({
              url: '/cardImgSave',
              type: 'post',
              enctype: "multipart/form-data",
              data: imgData,
              processData: false,
              contentType: false,
            })
            .done(function(response) {
              imgUrl = response;
              if( object != null){
                let image = document.createElement("img");
                $(image).css({
                  width : object.width(),
                });
                $(image).attr({
                  src : imgUrl,
                });

                object.append(image);

              }else{
              $('#editField')
              .css({
                'background' : `url('${imgUrl}') no-repeat`,
                'background-position' : 'center center',
                'background-color' : backgroundColor,
              });
              }
            })
            .fail(function(error) {
              console.log(error);
              alert('이미지 업로드를 실패하였습니다.');
            })

        }
      }
}
function autoThumnailSave(){
  let currentThumnail = $('.editing');
  let cardId = $('.editing').find('.card-editor').attr('data-cardid');
  currentThumnail.find('.card-editor').remove();
  $('#editField').clone(true)
  .addClass('thumnail-card-transform')
  .removeAttr('id')
  .attr('data-cardid', cardId)
  .find('.modal')
  .remove().end()
  .appendTo(currentThumnail);
}
  function isImage(file){
     return (file['type'].split('/')[0] =='image');//returns true or false
  }

  function dataURItoBlob(dataurl) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], {type:mime});
  }

})()
