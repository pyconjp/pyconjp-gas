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

  if (cached !== null && !nocache) {
    Logger.log('use cache');
    payload = cached;
  } else {
    Logger.log('no cache. fetching xml');
    const xml = getNewsXml(maxResult);
    payload = extractJsonStringFromXml(xml);
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
    , xml = UrlFetchApp.fetch(endpoint)
    ;
    return xml;
};


/**
 * Converts an XML string to a JSON object, using logic similar to the
 * sunset method Xml.parse().
 * @param {string} xml The XML to parse.
 * @returns {Object} The parsed XML.
 */
function xmlToJson(xml) { 
  const doc = XmlService.parse(xml)
    , root = doc.getRootElement()
    ;
  var result = {};
  result[root.getName()] = elementToJSON(root);
  return result;
}


/**
 * @param {string} xml
 * @returns {string} jsonString 
 */
function extractJsonStringFromXml(xml){
  const json = xmlToJson(xml)
    , contentObj = json['rss']['channel']
    ;
  jsonString = JSON.stringify(contentObj);
  return jsonString;
}


/**
 * Converts an XmlService element to a JSON object, using logic similar to 
 * the sunset method Xml.parse().
 * @param {XmlService.Element} element The element to parse.
 * @returns {Object} The parsed element.
 */
function elementToJSON(element) {
  const LIST_ELEMENT_NAMES = ['item']
    , children = element.getChildren()
  
  if (children.length == 0){
    return element.getText() || {} 
  }
  
  var result = {};
  children.forEach(function(child) {
    var key = child.getName()
      , value = elementToJSON(child)
      ;
      
    if (result[key]) {
      if (!(result[key] instanceof Array)) {
        result[key] = [result[key]];
      }
      result[key].push(value);
    } else {
      if (LIST_ELEMENT_NAMES.indexOf(key) > -1) {
        result[key] = [value];
      } else {
        result[key] = value;
      }
    }
  });
  return result;
}


function debug(){
  e = {'parameter': {'maxResult': 5, 'noCache': false}}
  res = doGet(e);
  Logger.log(res.getContent());
}
