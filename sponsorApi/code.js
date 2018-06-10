function doGet(e){
  const params = e.parameter
    , env = 'dev' // paramsから受け取る予定
    , sponsors = getSponsors(env)
    ;
  const res = {
    "kind": "all",
    "data": sponsors
  }
  
  return ContentService.createTextOutput(JSON.stringify(res));
}

function getSponsors(env){
  const id = spreadsheetId()
    , name = env
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
      sponsor[k] = v[i];
    })
    sponsors.push(sponsor);
  })
  
  return sponsors;
}

function debug() {
  Logger.log(getSponsors());
}