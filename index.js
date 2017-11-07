(function() {

// based on Bergi's https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects

function flatten(data) {
  var result = {};
  function recurse (cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for(var i=0, l=cur.length; i<l; i++)
        recurse(cur[i], prop ? prop+"."+i : ""+i);
      if (l === 0)
        result[prop] = [];
    } else {
      var isEmpty = true;
      for (var p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop+"."+p : p);
      }
      if (isEmpty) {
        result[prop] = {};
      }
    }
  }
  recurse(data, "");
  return result;
}

function unflatten(data) {
  "use strict";
  if (Object(data) !== data || Array.isArray(data)) {
    return data;
  }
  var result = {}, cur, prop, idx, last, temp;
  for(var p in data) {
    cur = result, prop = "", last = 0;
    do {
      idx = p.indexOf(".", last);
      temp = p.substring(last, idx !== -1 ? idx : undefined);
      cur = cur[prop] || (cur[prop] = (!isNaN(parseInt(temp)) ? [] : {}));
      prop = temp;
      last = idx + 1;
    } while(idx >= 0);
    cur[prop] = data[p];
  }
  return result[""];
}

// generator based on https://github.com/WebReflection/circular-json

var specialChar = '~',
  safeSpecialChar = '\\x' + (
    '0' + specialChar.charCodeAt(0).toString(16)
  ).slice(-2),
  specialCharRG = new RegExp(safeSpecialChar, 'g'),
  indexOf = [].indexOf || function(v){
    for(var i=this.length;i--&&this[i]!==v;);
    return i;
  };

function generateReplacer(value) {
  var
    resolve = true,
    path = [],
    all  = [value],
    seen = [value],
    mapp = [resolve ? specialChar : '[Circular]'],
    last = value,
    lvl  = 1,
    i
  ;
  return function(key, value) {
    // did you know ? Safari passes keys as integers for arrays
    // which means if (key) when key === 0 won't pass the check
    if (key !== '') {
      if (last !== this) {
        i = lvl - indexOf.call(all, this) - 1;
        lvl -= i;
        all.splice(lvl, all.length);
        path.splice(lvl - 1, path.length);
        last = this;
      }
      // console.log(lvl, key, path);
      if (typeof value === 'object' && value) {
        // if object isn't referring to parent object, add to the
        // object path stack. Otherwise it is already there.
        if (indexOf.call(all, value) < 0) {
          all.push(last = value);
        }
        lvl = all.length;
        i = indexOf.call(seen, value);
        if (i < 0) {
          i = seen.push(value) - 1;
          // key cannot contain specialChar but could be not a string
          path.push(('' + key).replace(specialCharRG, safeSpecialChar));
          mapp[i] = specialChar + path.join(specialChar);
        } else {
          value = mapp[i];
        }
      }
    }
    return value;
  };
}

function accessProperty(keys, parent) {
  var i, key;
  keys = keys.split('.');
  parent = parent || (typeof window !== 'undefined' ? window : global);
  for (i = 0; i < keys.length; i++) {
    key = keys[i];
    if (!parent.hasOwnProperty(key)) {
      return;
    }

    parent = parent[key];
  }

  return parent;
}

function discardCircular(object, parseToObject) {
  if (parseToObject) {
    return JSON.parse(JSON.stringify(object, generateReplacer(object)));
  } else {
    return JSON.stringify(object, generateReplacer(object));
  }
}

function filterValue(object, query, flattenFlag) {
  object = discardCircular(object, true);
  object = flatten(object);

  var result = {};
  for (var key in object) {
    if (object[key] === query) {
      result[key] = query;
    }
  }

  if (!flattenFlag) {
    return unflatten(result);
  } else {
    return result;
  }
}

function downloadStringified(object, space) {
  const string = JSON.stringify(object, null, space || 2);
  var file = new Blob([ string ], { type: 'text/plain' });
  a.href = URL.createObjectURL(file);
  a.download = 'file.txt';
  a.click();
}

var nestedObjectsUtil = {
  unflatten: unflatten,
  flatten: flatten,
  accessProperty: accessProperty,
  discardCircular: discardCircular,
  filterValue: filterValue
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = nestedObjectsUtil;
} else if (typeof document !== 'undefined') {
  var a = document.createElement('a');

  if (typeof Blob !== 'undefined' && typeof URL.createObjectURL === 'function' && typeof a.download !== 'undefined') {
    nestedObjectsUtil.downloadStringified = downloadStringified;
  }

  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return nestedObjectsUtil;
    });
  } else {
    window.NestedObjectsUtil = nestedObjectsUtil;
  }
}

})();