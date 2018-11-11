(function(){

  $('.workUpdateBtn').on('click', function(event){
    let data = $(this).data();
    $('#updateWorkTitleInput').val(data.title);
    $('#workDescriptionInput').val(data.description);
    $('#workIdInput').val(data.workid);
    $('#workUpdateModal').modal('show');
  })

  $('.work-generation-link').on('click', function(event){
    event.preventDefault();
    $('#workGenerationModal').modal('show');
  })

  $('.work-generation-btn').on('click',function(event){
    event.preventDefault();
    if($('#workTitleInput').val() ===''){
      alert('workTitle을 입력해야합니다.');
      return;
    }

    let workTitle = $('.work-form').serialize();

    $.ajax({
      type : 'post',
      url : '/workUpload',
      data : workTitle,
      dataType : 'json',
    }).done(function(response){
      let workData = response;
      let newWork = workGenerator(workData);
      console.log(newWork);
      $('.work-card-placeholder').prepend(newWork);

    }).fail(function(error){
      alert('서버와 연결이 실패 하였습니다.');
    }).always(function(response){

    })

    $('#workGenerationModal').modal('hide');
  })

  $('#workGenerationModal').on('hidden.bs.modal',function(){
    $('#workTitleInput').val('');
  });
  // $('.work-update-btn').on('click', function(event){
  //   let formData = $('.work-update-form').serialize();
  //   console.log(formData);
  //   $.ajax({
  //     type : 'get',
  //     url : '/workUpdate',
  //     data : formData,
  //     // dataType : 'json',
  //   }).done(function(response){
  //     let workData = response;
  //     console.log(reaponse);
  //   }).fail(function(error){
  //     alert('서버와 연결이 실패 하였습니다.');
  //   }).always(function(response){
  //
  //   })
  //
  //   $('#workGenerationModal').modal('hide');
  // });

  function workGenerator(workData){
    return `<li class="work-card-wrapper">
              <div class="card"><img class="work-card-img card-img-top" src="/image/default.jpg"/>
                <div class="card-body"><a class="work-link" href="/workpage?workId=${workData.workId}">${workData.workTitle}</a></div>
              </div>
            </li>`
  }

})();
