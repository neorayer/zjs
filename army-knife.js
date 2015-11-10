var exports = exports || {};


Clone = exports.Clone = function(src) {
    var dest = {};
    ValueCopy(src, dest);
    return dest;
}
//复制。
//1 只赋值属性，不复制方法。
//2 不会循环。
//3 不复制DOM
ValueCopy = exports.ValueCopy = function (__src, __dest) {
    if (!__src)
        return;

    //用以记录曾经遍历过的对象，避免无限循环遍历
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
        //Array.isArray可能有些浏览器不支持
        if (Array.isArray && Array.isArray(o))
            return true;
        return false;
    }

    function copy(src, dest) {
        for(var key in src) {
            // NOTES:修复浏览器的一个BUG
            if (key === 'selectionDirection' 
                || key === 'selectionEnd' 
                || key === 'selectionStart')
                continue;
            var val = src[key];
            //不复制DOM
            if (val instanceof HTMLElement)
                continue;
            //不复制function
            if (typeof(val) === 'function') 
                continue;
            if (typeof(val) === 'object') {
                //如果是曾经遍历copy过的对象，则只复制一个引用
                if (hasBeenCopied(val)) {
                    dest[key] = val;
                    continue;
                }

                //记录遍历过的对象
                objects.push(val);

                //需要区分object和array。
                dest[key] = isArray(val) ? [] : {};

                copy(val, dest[key]);
            }else {
                dest[key] = val;
            }
        }
    }

    copy(__src, __dest);
}

var SNAKE_CASE_REGEXP = /[A-Z]/g;
SnakeCase = exports.SnakeCase = function(name, separator) {
  separator = separator || '_';
  return name.replace(SNAKE_CASE_REGEXP, function(letter, pos) {
    return (pos ? separator : '') + letter.toLowerCase();
  });
}

// 首字母大写
CapitalFirst = exports.CapitalFirst = function (word) {
    if (word.length === 0)
        return word;
    return word.substring(0,1).toUpperCase( ) + word.substring(1);;
}

NiceTrim = exports.NiceTrim = function (obj, key) {

    if (!obj)
        return;
    if (!obj[key])
        return;

    obj[key] = obj[key].trim().replace(/ +/g, ' ');
}


PurifyData = exports.PurifyData = function(data) {
    for(var k in data){
        //去除所有$开头的属性
        if (k.indexOf('$') === 0) {
            delete data[k];
            continue;
        }
        switch(typeof data[k]) {
            // 删除function
            case 'function':
                delete data[k];
                break;
            //递归到属性里去遍历
            case 'object':
                PurifyData(data[k]);
                break;
        }
    }
}

// Arguments :
//  verb : 'GET'|'POST'
//  target : an optional opening target (a name, or "_blank"), defaults to "_self"
OpenWindow = exports.OpenWindow = function(verb, url, data, target) {
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












/////////////////////////////////////////////////////////
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



// Save === 有则更改，无则新增
//    有无的判断条件为cond
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

// Save === 有则更改，无则新增
//   key为要判断的属性名
Array.prototype.SaveOneByKey = function(key, item) {
    if (typeof(key) !== 'string')
        throw 'Array.SaveOneByKey(key, item). key must be string';
    if (!item[key]) {
console.log(key, item); // ****************
        throw 'Error: Array.SaveOneByKey: item.' + key + ' should not be null';
    }

    var cond = {};
    cond[key] = item[key];

    this.SaveOneByCondition(cond, item);
}

// Save === 有则更改，无则新增
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

// ////////////////////////////////////////////////////////////
// var StandControllerInit = function($scope, $state, mn /* Model Name */, rs) {
//     var listName = mn + 's';
//     var formModelName = 'form' + CapitalFirst(mn);
//     var idName = mn + 'Id';

//     if (!$scope[listName]) {
//         $scope[listName] = [];
//         rs.Load().then(function(datas){
//             $scope[listName]= datas;
//         });
//     }

//     $scope[formModelName] = {};

//     if ($state.params[idName] && $state.params[idName] !== 'new') {
//         $scope[mn] = Cache.get($state.params[idName]);
//         $scope[formModelName] = angular.copy($scope[mn]);
//     }
// }