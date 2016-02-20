'use strict'

var exports = exports || {};


var Clone = exports.Clone = function(src) {
    var dest = {};
    ValueCopy(src, dest);
    return dest;
}


/**
 * ValueCopy
 * 1. Only copy properties, not copy methods(functions).
 * 2. Loop traversing has been avoided.
 * 3. the DOM/HTMLElement properties will NOT be copyed.
 */
var ValueCopy = exports.ValueCopy = function (__src, __dest) {
    if (!__src)
        return;

    // objects is used to store the Object-type properties, to avoid traversing loop 
    var objects = [__src];
    function hasBeenCopied(object) {
        for(var i=0; i<objects.length; i++) {
            if (objects[i] === object)
                return true;
        }
        return false;
    }

    function isArray(o) {
        if (o instanceof Array)
            return true;
        //Array.isArray is not supported in older browser.
        if (Array.isArray && Array.isArray(o))
            return true;
        return false;
    }

    function copy(src, dest) {
        for(var key in src) {
            // NOTES: to fixed a bug of some browsers
            if (key === 'selectionDirection' 
                || key === 'selectionEnd' 
                || key === 'selectionStart')
                continue;
            var val = src[key];
            //NO copy DOM
            if (val instanceof HTMLElement)
                continue;
            //NO copy function
            if (typeof(val) === 'function') 
                continue;
            if (typeof(val) === 'object') {
                // only the reference of object will be copyed, if it has been copyed
                if (hasBeenCopied(val)) {
                    dest[key] = val;
                    continue;
                }
                objects.push(val);

                // Deal with object/array in two ways
                dest[key] = isArray(val) ? [] : {};

                copy(val, dest[key]);
            }else {
                dest[key] = val;
            }
        }
    }

    // Recursive!
    copy(__src, __dest);
}


var SNAKE_CASE_REGEXP = /[A-Z]/g;
var SnakeCase = exports.SnakeCase = function(name, separator) {
  separator = separator || '_';
  return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
    return (pos ? separator : '') + letter.toLowerCase();
  });
}


var CapitalFirst = exports.CapitalFirst = function (word) {
    if (word.length === 0)
        return word;
    return word.substring(0,1).toUpperCase( ) + word.substring(1);;
}


var NiceTrim = exports.NiceTrim = function (obj, key) {
    if (!obj)
        return;
    if (!obj[key])
        return;
    obj[key] = obj[key].trim().replace(/ +/g, ' ');
}


/**
 * The props of data matching below conditions will be removed.
 * 1. Start with '$'.
 * 2. Functions.
 * 3. Any depth of the prop matching 1 and 2.0
 */
var PurifyData = exports.PurifyData = function(data) {
    for(var k in data){
        // Remove: start with $
        if (k.indexOf('$') === 0) {
            delete data[k];
            continue;
        }
        switch(typeof data[k]) {
            // Remove: function
            case 'function':
                delete data[k];
                break;
            // Recursive
            case 'object':
                PurifyData(data[k]);
                break;
        }
    }
}


/** 
 * Similar with  window.open() but updated by supporting 'POST'
 * @param {string} verb  'GET'|'POST'
 * @param {string} url 
 * @param {string} data the parameters of url
 * @param {string} target an optional opening target (a name, or "_blank"), defaults to "_self"
 */
var OpenWindow = exports.OpenWindow = function(verb, url, data, target) {
    var form = document.createElement("form");
    form.action = url;
    form.method = verb;
    form.target = target || "_self";
    if (data) {
        for (var key in data) {
            var input = document.createElement("textarea");
            input.name = key;
            input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
            form.appendChild(input);
        }
    }
    form.style.display = 'none';
    document.body.appendChild(form);
    form.submit();
};


/**
 * Convert object to url query string
 */
var ObjectToQuery = exports.ObjectToQuery = function(obj, prefix) {
    if (!obj) return "";
    var str = [];
    for(var p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + "[" + p + "]" : p;
            var v = obj[p];
            str.push(typeof v == "object" ?
                   serialize(v, k) :
            encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
    }
    return str.join("&");
}

/**
 * Throw out a object with format {field: xxxx, msg: xxx, error: ....}
 */
var ThrowError = exports.ThrowError = function(field, msg) {
    throw {field: field, error: new Error(msg)};
}



/////////////////////////////////////////////////////////
// Array prototype enghance
/////////////////////////////////////////////////////////

/**
 * @return true, if
 * 1. every prop of cond exists in obj, and
 * 2, both value are same.
 */
function isCondMatch(obj, cond) {
    if (!cond)
        return true;
    for (var key in cond) {
        if (obj[key] !== cond[key]) { 
            return false;
        }
    }
    return true;
}

Array.prototype.Delete = function(item) {
    for (var i=0; i<this.length; i++) {
        if (this[i] == item) {
             this.splice(i, 1);
             break;
        }
    }
}

Array.prototype.DeleteByCondition = function(cond) {
    var i = 0;
    while( i < this.length) {
        if (isCondMatch(this[i], cond)) {
             this.splice(i, 1);
        } else {
            i++;
        }
    }
}

Array.prototype.Find = function(cond) {
    var res = [];
    this.forEach(function(item){
        if (isCondMatch(item, cond)) {
            res.push(item);
        }
    })
    return res;
}

Array.prototype.Count = function(cond) {
    var i = 0;
    this.forEach(function(item){
        if (isCondMatch(item, cond)) {
            i++;
        }
    })
    return i;
}

Array.prototype.FindOne = function(cond) {
    for (var i=0; i < this.length; i++)
        if (isCondMatch(this[i], cond))
            return this[i];
}

Array.prototype.InsertAfter = function(itemInsert, itemAfter) {
    var idx = this.indexOf(itemAfter);
    this.splice(idx+1, 0, itemInsert);
}

Array.prototype.Replace = function(oldItem, newItem) {
    for (var i=0; i<this.length; i++) {
        if (this[i] == oldItem) {
            this[i] = newItem;
            break;
        }
    }
}

Array.prototype.ReplaceOneByCondition = function(cond, newItem) {
    for (var i=0; i<this.length; i++) {
        if (isCondMatch(this[i], cond)) {
            this[i] = newItem;
            break;
        }
    }
}

/**
 *  Update one of the item in array if matching cond, or push into array. 
 */
Array.prototype.SaveOneByCondition = function(cond, item) {
    for (var i=0; i<this.length; i++) {
        if (isCondMatch(this[i], cond)) {
            // found it, then replace,then return
            this[i] = item;
            return;
        }
    }

    // no found, push it
    this.push(item);
}


/**
 * Update one of the item in array if matching condition, or push into array. 
 * The condition is cond[key] = item[key]
 */
Array.prototype.SaveOneByKey = function(key, item) {
    if (typeof(key) !== 'string')
        throw 'Array.SaveOneByKey(key, item). key must be string';
    if (!item[key]) {
        throw 'Error: Array.SaveOneByKey: item.' + key + ' should not be null';
    }

    var cond = {};
    cond[key] = item[key];

    this.SaveOneByCondition(cond, item);
}

/**
 * Similar with SaveOneByKey(), but every props must equal.
 */
Array.prototype.SaveOne = function(item) {
    for (var i=0; i<this.length; i++) {
        if (this[i] === item) {
            return;
        }
    }

    // no found, push it
    this.push(item);
}

Array.prototype.SaveArray = function(items) {
    for (var i=0; i<items.length; i++)
        this.SaveOne(items[i]);
}

Array.prototype.DeleteArray = function(items) {
    for (var i=0; i<items.length; i++)
        this.Delete(items[i]);
}

Array.prototype.PushArray = function(items) {
    for (var i=0; i<items.length; i++)
        this.push(items[i]);
}



/**
 * @return a number array with years from beginY to endY. 
 * example: YearsArray(2000, 2005) =>
 *  [2000, 2001, 2002, 2003, 2004, 2005]
 *
 * TODO: the code should be moved to other module late
 */
var YearsArray = exports.YearsArray = function(beginY, endY) {
    var years = new Array();
    if (endY >= beginY) {
        for(var i=beginY; i<=endY; i ++) {
            years.push(i);
        }
    } else {
        for(var i=beginY; i>=endY; i --) {
            years.push(i);
        }
    }
    return years;
}