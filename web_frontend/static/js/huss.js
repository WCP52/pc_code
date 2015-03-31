$(document).ready(function() {
  /* disable caching...
   * IE does some aggressive caching and returns old data
   */
  $.ajaxSetup({ cache: false });

  /*
   *
   * Actual DataTable
   *
   */
    var oTable = $('#servicetable').dataTable( {
        "bProcessing": true,
        "sAjaxSource": $SCRIPT_ROOT +"/get_datatables.json",
        "bAutoWidth" : true,
        "iDisplayLength" : 15,
        "oLanguage": {
                    "sLengthMenu" : '<select>'+
                                    '<option value="10">10</option>'+
                                    '<option value="15">15</option>'+
                                    '<option value="25">25</option>'+
                                    '<option value="50">50</option>'+
                                    '<option value="100">100</option>'+
                                    '<option value="-1">All</option>'+
                                    '</select> records per page'
                    },
        "aoColumns": [
            {"sTitle": "Last Modified", 
              "sWidth"    : "20px",
              "iDataSort" : 0,
              "mData"     : "last_modified_time",
              "fnRender"  : function (o) {
              var date = new Date(o.aData["last_modified_time"]*1000);
              var month = (date.getMonth()+1) > 9 ? (date.getMonth()+1) : "0" + (date.getMonth()+1);
              var day = (date.getDate()) > 9 ? (date.getDate()) : "0" + (date.getDate());
              var hours = (date.getHours()) > 9 ? (date.getHours()) : "0" + (date.getHours());
              var minutes = (date.getMinutes()) > 9 ? (date.getMinutes()) : "0" + (date.getMinutes());
              var seconds = (date.getSeconds()) > 9 ? (date.getSeconds()) : "0" + (date.getSeconds());
              var dateString = 
                  month + "/" + 
                  day + "/" + 
                  date.getFullYear() + "<br>" +
                  hours + ":" + 
                  minutes + ":" + 
                  seconds;
                return "<div class= date>"+dateString+"<div>";
                }
            },
            {"sTitle": "Service", "mData"       : "service_name"},
            {"sTitle": "Summary", "mData"       : "description"},
            {"sTitle": "NetGroup","mData"       : "netgroup"},
            {"sTitle": "User",    "mData"       : "user_name"},
            {"sTitle": "Actions",
             "sWidth"   : "130px",
             "mData"    : null,
             "bSortable": false,
             "fnRender" : function (o) { 
return '<a href=\"#\" row-id=\"'+ o.aData['id'] +'\"class=\"EditServiceBtn btn\">Edit</a> <a href=\"#\" row-id=\"'+ o.aData['id'] +'\"class=\"DeleteServiceBtn btn btn-danger\">Delete</a>'}
            }
        ],
        "fnPreDrawCallback": function(oSettings, json) {
               $('.dataTables_filter input').addClass('form-control input-sm');
               $('.dataTables_filter input').css('width', '200px');
               $('.dataTables_length select').addClass('form-control input-sm');
               $('.dataTables_length select').css('width', '75px');
        },
        "fnDrawCallback": function() {
            clickRowHandler();
        }

  });

  //immediately sort by newest modification date
  oTable.fnSort( [ [0,'desc'] ]);
  

  /*
   * Serialize form into a json message
   */
  $.fn.serializeForm = function()
  {
      var o = {};
      var a = this.serializeArray();
      $.each(a, function() {
          if (o[this.name] !== undefined) {
              if (!o[this.name].push) {
                  o[this.name] = [o[this.name]];
              }
              o[this.name].push(this.value || '');
          } else {
              o[this.name] = this.value || '';
          }
      });
      return o;
  };

  /*
   * jQuery form-validator plugin
   */
   $.validate();


  /*
   * clear all input fields in form
   */
  function resetForm($form) {
    $form.find('input:text, input:password, input:file, select, textarea').val('');
    $form.find('input:radio, input:checkbox')
      .removeAttr('checked').removeAttr('selected');
  }

  /* 
   * Submit form function
   */
  function submitServiceForm() {
    if ( $("#service_form").validateForm(conf.language, conf) ){
      // serialize form
      json_data = $('#service_form').serializeForm();

      // if this is an edit dialog, add the "id" key/val to the json data
      var text = $("#ServiceModal h4").text();
      var myRegex = /Edit Service (\d+)/g;
      var match = myRegex.exec(text);
      if (match != null)
      {
        json_data['id']= match[1];
      }

      /*
      * AJAX post to server
      */
      $.ajax( { 
      url: $SCRIPT_ROOT +"/form_submit.json",
      contentType: "application/json; charset=utf-8",
      method: "POST",
      dataType: "json",
      data: JSON.stringify( json_data ),
      success: function ( data ) {
        $("#ServiceModal").modal("hide");
        if ( data.status != 'OK' ){
            alert(data.status);
        }
        oTable.fnReloadAjax();
      },
      error: function ( req, reqStatus, reqObj ) {
        alert("ERROR! Server returned error from ajax submit, try again");
      }
      });
    }
  }

  /*
   * Delete record function
   */
  function deleteServiceRecord() {
    // if this is a delete dialog, add the "id" key/val to the json data
    var json_data = {};
    var text = $("#DeleteModal h4").text();
    var myRegex = /Delete Service (\d+)/g;
    var match = myRegex.exec(text);
    if (match != null)
    {
      json_data['id']= match[1];

      $.ajax( { 
        url: $SCRIPT_ROOT +"/delete_row",
        contentType: "application/json; charset=utf-8",
        method: "GET",
        dataType: "json",
        data: json_data,
        success: function ( data ) {
          $("#DeleteModal").modal("hide");
          if ( data.status != 'OK' ){
            alert(data.status);
          }
          oTable.fnReloadAjax();
        },
        error: function ( req, reqStatus, reqObj ) {
          alert("ERROR! Server returned error from ajax submit, try again");
        }
      });
    }

  }


  /*
   * click handlers
   */

  // New Service Button
  $("#NewServiceButton").click(function () {
    $("#ServiceModal h4").text("Add a New Service");
    //clear input fields
    resetForm($('#service_form'));
    $("#ServiceModal").modal("show");
  });

  /* 
   * configuration for validation plugin
   */
  var conf = $.extend($.formUtils.defaultConfig(), {
        form : 'service_form',
        validateOnEvent : true,
        validateOnBlur : true,
        showHelpOnFocus : true,
        addSuggestions : true,
        modules : '',
        onModulesLoaded : null,
        language : false,
        onSuccess : false,
        onError : false
    });

  // double click row handler
  function clickRowHandler() {
    $('#servicetable tbody tr').bind('dblclick', function () {
        var aData = oTable.fnGetData( this );
        showEditDialog( aData['id'] );
    });
  }

  // submit button pressed... submit form.. duhh
  $("#SubmitButton").click(function () {
    submitServiceForm();
  });

  // enter pressed... submit form
  $('.form-enter-detect').bind('keypress', function(e) {
    var code = e.keyCode || e.which;
    if(code==13){
      // Enter pressed... 
      submitServiceForm();
    }
  });
  
  // enter pressed... delete row
  $('#DeleteModal').bind('keypress', function(e) {
    var code = e.keyCode || e.which;
    if(code==13){
      // Enter pressed... 
      deleteServiceRecord();
    }
  });

  // yes button handler
  $("#YesButton").click(function () {
      deleteServiceRecord();
  });

  // reset form if modal is hidden
  $("#ServiceModal").on('hidden.bs.modal', function () {
    document.getElementById('service_form').reset();
  });
  
  /* 
   * Show edit dialog box function
  */
  function showEditDialog(row_id) {
    $("#ServiceModal h4").text("Edit Service "+row_id);
    /*
    * Get info about service from server
    * perform an ajax POST
    */
    $.ajax( { 
      url: $SCRIPT_ROOT +"/get_row",
      contentType: "application/json; charset=utf-8",
      method: "GET",
      dataType: "json",
      data: { "row_id": row_id },
      success: function ( json ) {
        if (json.status == 'OK'){
          $.each( json, function( key, val ) {
            // pre-populate the fields
            $('input[name="'+key+'"]').val(val);
            $('textarea[name="'+key+'"]').val(val);
          });
        }
        else{
          alert(json.status);
        }
      },
      error: function ( req, reqStatus, reqObj ) {
        alert("ERROR! Server returned error from ajax submit, try again");
      }

    });

    $("#ServiceModal").modal("show");
  }

  /*
   * Delegated event handlers
   * these click handlers act on "future" buttons
   * because datatables generates the table from an
   * ajax request
   */

  // Edit button
  $("#servicetable").on("click", ".EditServiceBtn", function () {
    showEditDialog( $(this).attr('row-id') );
  });

  // Delete button
  $("#servicetable").on("click", ".DeleteServiceBtn", function () {
    var row_id = $(this).attr('row-id');
    $("#DeleteModal h4").text("Delete Service "+row_id);
    $("#DeleteModal").modal("show");
  });

}); //end document ready
