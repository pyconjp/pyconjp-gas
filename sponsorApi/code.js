function doGet(e){
  const params = e.parameter
    , kind = params["kind"] || "all"
    , stage = params["stage"] || "dev"
    , sponsors = getSponsors(stage)
    ;
  const res = {
    "kind": kind,
    "stage": stage,
    "data": sponsors
  }
  
  return ContentService.createTextOutput(JSON.stringify(res));
}

function getSponsors(stage){
  const EXCLUDED_KEY = ["logoDriveUrl"];
  const id = spreadsheetId()
    , name = stage
    , sheet = SpreadsheetApp.openById(id).getSheetByName(name)
    , data = sheet.getDataRange().getValues()
    , keys = data[0]
    , vals = data.slice(1)
    ;
  var sponsors = []
    , sponsor
    ;
  
  vals.forEach(function(v){
    sponsor = {}
    keys.forEach(function(k, i){
      if(EXCLUDED_KEY.indexOf(k) > -1){return} 
      sponsor[k] = v[i];
    })
    sponsors.push(sponsor);
  })
  
  return sponsors;
}

function debug() {
  Logger.log(getSponsors("dev"));
}