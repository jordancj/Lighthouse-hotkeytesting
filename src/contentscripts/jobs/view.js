var inject = require('../../../lib/inject.js');
var _ = require('underscore');
var DOM = require('jsx-dom-factory');
var $ = require('jquery');


window.addEventListener("message", function(event) {
  // We only accept messages from ourselves or the extension
  if (event.source != window)
    return;
  if (event.data.type && (event.data.type == "FROM_PAGE")) {
        if(typeof event.data == 'undefined') { //address passed is defined
          $('#asbestos-register-text').html("Not A Searchable Address");
        } else {
          if (event.data.address.Street == null || event.data.address.StreetNumber == null)
          {
      //we need at least an street name to search
      $('#asbestos-register-text').html("Not A Searchable Address");
    } else {
      chrome.runtime.sendMessage({type: "asbestos", address: event.data.address}, function(response) {
        $('#asbestos-register-text').html(response.result);
        $('#asbestos-register-box').click(function(){
          window.open(response.requrl)
        })
        $('#asbestos-register-box').css('cursor','pointer');
        if (response.colour != "") {
          $('#asbestos-register-box')[0].style.color = "white"
          $('#asbestos-register-box').css({'background' :'linear-gradient(transparent 8px, '+response.colour+' -10px','margin-left':'17px'});
        }
      });
    }
  }
}
}, false);


function renderQuickText(id, selections) {
  return (
    <div class="form-group">
    <div class="row">
    <label class="col-md-4 col-lg-3 control-label">
    <img style="width:16px;vertical-align:top;margin-right:5px"
    src={chrome.extension.getURL("icons/lh-black.png")} />
    Quick Text
    </label>
    <div class="col-md-8 col-lg-9">
    <select class="form-control" id={id} style="width:100%">
    {
      _.map(selections, function(selection) {
        return <option>{selection}</option>;
      })
    }
    </select>
    </div>
    </div>
    </div>
    );
}





// Quick Text - Job - Finalise
$('#finaliseJobModal .modal-body .form-group:nth-child(1)').after(
  renderQuickText("FinaliseQuickTextBox", [
    "",
    "All paperwork and documentation completed",
    "NFA",
    "Job completed"
    ])
  );

// Quick Text - Job - Complete
// this is nth-child(1) even though there are more elements because
// at the time this code _usually_ runs knockout hasn't been initialised
// yet so there are less elements than after it has rendered.
// TODO: make this more intelligent by searching for the appropriate
// label and inserting before/after that.
$('#completeRescueModal .modal-body .form-group:nth-child(1)').after(
  renderQuickText("CompleteQuickTextBox", [
    "",
    "All paperwork and documentation completed",
    "NFA",
    "NFA SES. Referred to council",
    "Job completed"
    ])
  );

// Quick Actions - Job - Team Complete
var options = [
["Storm/Tree Ops",         "stormtree",        "tag-task"],
["Storm/Property Protect", "stormproperty",    "tag-task"],
["Storm/Public Safety",    "stormsafety",      "tag-task"],
["Storm/Road Access",      "stormaccess",      "tag-task"],
["Storm/Recon",            "stormrecon",       "tag-task"],
["RCR/Calloff",            "rcrcalloff",       "tag-rescue"],
["RCR/Extricate",          "rcrcallextricate", "tag-rescue"]
];

var html = (
  <div class="form-group">
  <div class="row">
  <label class="col-md-4 col-lg-3 control-label">
  <img style="width:16px;vertical-align:top;margin-right:5px"
  src={chrome.extension.getURL("icons/lh-black.png")} />
  Quick Tasks
  </label>
  <div class="col-md-8 col-lg-9">
  {
    _.map(options, function(option) {
      return (
        <span id={option[1]} class={'label tag tag-disabled '+option[2]}>
        <span class="tag-text">{option[0]}</span>
        </span>
        );
    })
  }
  </div>
  </div>
  </div>
  );

// Quick Text - Job - Team Complete
var html2 = renderQuickText("CompleteTeamQuickTextBox", [
  "",
  "NSW SES volunteers attended scene and resident no longer required assistance.",
  ])

$('#completeTeamModal .modal-body .form-group:nth-child(12)').after([html, html2]);

// Insert element into DOM - Will populate with AJAX results via checkAddressHistory()
job_view_history = (
  <fieldset id="job_view_history_groups" class="col-md-12">
  <legend class="main"><img style="width:16px;vertical-align:inherit;margin-right:5px"
  src={chrome.extension.getURL("icons/lh-black.png")} />Job History <span>12 Months search by Address</span></legend>
  <div id="job_view_history_container">
  <div style="text-align:center">
  <img src="/Content/images/loading_30.gif" />
  </div>
  </div>
  </fieldset>
  );

// Insert element into DOM - Will populate with AJAX results via checkAddressHistory()
job_asbestos_history = (
  <div class="form-group">
  <label class="col-xs-3 col-sm-2 col-md-4 col-lg-3 control-label"><img style="margin-left:-21px;width:16px;vertical-align:inherit;margin-right:5px"
  src={chrome.extension.getURL("icons/lh-black.png")} />Fairtrade Register</label>
  <div id="asbestos-register-box" class="col-xs-9 col-sm-10 col-md-8 col-lg-9" style="width:inherit">
  <p id="asbestos-register-text" class="form-control-static">Searching...</p>
  </div>
  </div>
  );

$('fieldset.col-md-12').each(function(k,v){
  var $v = $(v);
  var $p = $v.closest('fieldset');
  var section_title = $v.text().trim();
  if( section_title.indexOf( 'Notes' ) === 0 || section_title.indexOf( 'Messages' ) === 0 ){
    $p.before(job_view_history);
    return false; // break out of $.each()
  }
});

$('fieldset.col-md-12').each(function(k,v){
  var $v = $(v);
  var section_title = $v[0].children[0].innerText;

  if(section_title.indexOf( 'Job Details' ) === 0 ) {
    $v.append(job_asbestos_history)
    return false;
  }

})





// inject the coded needed to fix visual problems
// needs to be injected so that it runs after the DOMs are created
// We run this last because we want to ensure the elements created above have
// been loaded into the DOM before the injected script runs
inject('jobs/view.js');
