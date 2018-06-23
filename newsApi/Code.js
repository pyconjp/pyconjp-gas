/**
 * Endpoint of api
 * @param None
 * @returns {Object} TextOutput 
 */
function doGet(e) {
  const params = e.parameter
    , maxResult = params["maxResult"] || 5
    , nocache = params["noCache"] || false
    , cache = CacheService.getScriptCache()
    ;

  // Check cache
  const cached = cache.get("news_maxResult"+maxResult);
  var payload;

  if (cached != null && !nocache) {
     Logger.log('use cache');
     payload = cached;
  } else {
    Logger.log('no cache. fetching xml');
    const xml = getNewsXml(maxResult)
     , json = XML_to_JSON(xml)
     , contentObj = json['rss']['channel']
     ;
    payload = JSON.stringify(contentObj);
    cache.put("news_maxResult"+maxResult, payload, 1800); // cache for 30 minutes
  }

  return ContentService.createTextOutput(payload);
}


/**
 * Get latest news from rss feeds 
 * using cache within 30min.
 * @returns {string} xml 
 */
function getNewsXml(maxResult) {
  const endpoint = 'http://pyconjp.blogspot.com/feeds/posts/default/-/pyconjp2018?alt=rss&max-results=' + maxResult
   var xml = UrlFetchApp.fetch(endpoint);
   return xml;
};


/**
 * Converts an XML string to a JSON object, using logic similar to the
 * sunset method Xml.parse().
 * @param {string} xml The XML to parse.
 * @returns {Object} The parsed XML.
 */
function XML_to_JSON(xml) { 
  var doc = XmlService.parse(xml);
  var result = {};
  var root = doc.getRootElement();
  result[root.getName()] = elementToJSON(root);
  return result;
}


/**
 * Converts an XmlService element to a JSON object, using logic similar to 
 * the sunset method Xml.parse().
 * @param {XmlService.Element} element The element to parse.
 * @returns {Object} The parsed element.
 */
function elementToJSON(element) {
  var result = {};
  // Child elements.
  const children = element.getChildren()
  
  if (children.length == 0){
    if (element.getText()) {
      result = element.getText();
    }
    return result;
  }
  
  children.forEach(function(child) {
    var key = child.getName();
    var value = elementToJSON(child);
    if (result[key]) {
      if (!(result[key] instanceof Array)) {
        result[key] = [result[key]];
      }
      result[key].push(value);
    } else {
      result[key] = value;
    }
  });
  return result;
}


function debug(){
  e = {'parameter': {'maxResult': 5, 'noCache': false}}
  res = doGet(e);
  Logger.log(res.getContent());
}
