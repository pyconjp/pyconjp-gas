/**
 * Endpoint of api
 * @param None
 * @returns {Object} TextOutput 
 */
function doGet(e){
  const params = e.parameter
    , stage = params["stage"] || "dev"
    , nocache = params["noCache"] || false
    , cache = CacheService.getScriptCache()
    ;
  
  // Check cache
  const cached = cache.get("sponsor_"+stage);
  var payload;

  if (cached != null && !nocache) {
     Logger.log('use cache');
     payload = cached;
  } else {
    Logger.log('no cache. getting from spreadsheet');
    
    const sponsors = getSponsors(stage);
    payload = JSON.stringify({ stage: stage, data: sponsors });

    cache.put("sponsor_"+stage, payload, 300); // cache for 5 minutes
  }
  
  return ContentService.createTextOutput(payload);
}


function getSponsors(stage){
  const EXCLUDED_KEY = ["logoDriveUrl"];
  const id = spreadsheetId()
    , sheet = SpreadsheetApp.openById(id).getSheetByName(stage)
    , data = sheet.getDataRange().getValues()
    , keys = data[0]
    , vals = data.slice(1)
    ;
  var sponsors = []
    , sponsor
    ;
  
  vals.forEach(function(v){
	sponsor = {}
    var k;
    for(var i = 0; i < keys.length; i++){
      k = keys[i];
      if(k === "stateId" && v[i] !== 1){ break }
      if(EXCLUDED_KEY.indexOf(k) > -1){ continue }
     
		sponsor[k] = v[i];
    }
	sponsors.push(sponsor);
  })
  
  return sponsors;
}

function debug() {
  e = {'parameter': {'stage': "prod", 'noCache': true}}
  res = doGet(e);

  Logger.log(res.getContent());
}