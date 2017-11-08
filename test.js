'use strict';

var assert = require('assert');
var nestedObjectsUtil = require('./');

describe('nested-objects-util', function() {

  it('should flatten an object', function() {
    var flattened = nestedObjectsUtil.flatten({
      keyA: {
        keyB: {
          keyC: 'value'
        },
        keyD: 'value2'
      }
    });
    assert.deepEqual(flattened, {
      'keyA.keyB.keyC': 'value',
      'keyA.keyD': 'value2'
    });
  });

  it('should unflatten an object', function() {
    var unflattened = nestedObjectsUtil.unflatten({
      'keyA.keyB.keyC': 'value',
      'keyA.keyD': 'value2'
    });
    assert.deepEqual(unflattened, {
      keyA: {
        keyB: {
          keyC: 'value'
        },
        keyD: 'value2'
      }
    });
  });

  it('should access object\'s nested property' , function() {
    var nestedObject = {
      keyA: {
        keyB: {
          keyC: 'value'
        }
      }
    };
    var accessedValue = nestedObjectsUtil.accessProperty('keyA.keyB.keyC', nestedObject);
    assert.deepEqual(accessedValue, nestedObject.keyA.keyB.keyC);
  });

  it('should access object\'s nested property without providing parent' , function() {
    global.object = {
      key: 'value'
    };
    var accessedValue = nestedObjectsUtil.accessProperty('object.key');
    assert.deepEqual(accessedValue, global.object.key);
  });

  it('should discard circular references', function() {
    var a = {
      b: 1
    };
    a.c = a;
    a.d = a.c;
    var string = nestedObjectsUtil.discardCircular(a);
    assert.deepEqual(string, '{"b":1,"c":"~","d":"~"}');
    var object = nestedObjectsUtil.discardCircular(a, true);
    assert.deepEqual(object, {
      b: 1,
      c: '~',
      d: '~'
    });
  });

  it('should filter out all the keys with param value', function() {
    var a = {
      b: {
        c: 'str',
        d: 'str2'
      },
      e: 'str',
      f: {
        g: {
          h: 'str',
          i: 'str2'
        },
        j: 'str4'
      }
    };
    a.k = a.b;
    var filtered = nestedObjectsUtil.filterValue(a, 'str');
    assert.deepEqual(filtered, {
      b: {
        c: 'str'
      },
      e: 'str',
      f: {
        g: {
          h: 'str'
        }
      }
    });
    var filteredFlattened = nestedObjectsUtil.filterValue(a, 'str2', true);
    assert.deepEqual(filteredFlattened, {
      'b.d': 'str2',
      'f.g.i': 'str2'
    });
  });

  it('should return flattened, formatted and stringified json (no circular references)' , function() {
    var a = {
      b: 1,
      c: {
        d: 2,
        e: 2
      }
    };
    var obj = nestedObjectsUtil.discardCircular(a, true);
    var json = nestedObjectsUtil.downloadStringified(obj);
    assert.deepEqual(json, '{\n  "b": 1,\n  "c": {\n    "d": 2,\n    "e": 2\n  }\n}');
  });

  it('should return flattened, formatted and stringified json (circular references)' , function() {
    var a = {
      b: 1,
      c: {
        d: 2,
        e: 2
      }
    };
    a.f = a;
    a.g = a.f;
    var obj = nestedObjectsUtil.discardCircular(a, true);
    var json = nestedObjectsUtil.downloadStringified(obj);
    assert.deepEqual(json, '{\n  "b": 1,\n  "c": {\n    "d": 2,\n    "e": 2\n  },\n  "f": "~",\n  "g": "~"\n}');
  });

  it('should return filtered, flattened, formatted and stringified json (circular references)' , function() {
    var a = {
      b: 1,
      c: {
        d: 2,
        e: 2
      }
    };
    a.f = a;
    var filtered = nestedObjectsUtil.filterValue(a, 2, true);
    var json = nestedObjectsUtil.downloadStringified(filtered);
    assert.deepEqual(json, '{\n  "c.d": 2,\n  "c.e": 2\n}');
  });

});