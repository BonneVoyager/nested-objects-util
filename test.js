'use strict';

var assert = require('assert');
var nestedObjectsUtil = require('./');

describe('nested-objects-util', function() {

  describe('flatten', function() {
    it('should flatten an object', function() {
      var flattened = nestedObjectsUtil.flatten({
        keyA: {
          keyE: [ 'value3', 'value4' ],
          keyF: null,
          keyD: 'value2',
          keyB: {
            keyC: 'value'
          }
        }
      });
      var stringifiedFlattened = JSON.stringify(flattened);
      var stringifiedCompare = JSON.stringify({
        'keyA.keyE.0': 'value3',
        'keyA.keyE.1': 'value4',
        'keyA.keyF': null,
        'keyA.keyD': 'value2',
        'keyA.keyB.keyC': 'value'
      });
      assert.equal(stringifiedFlattened === stringifiedCompare, true);
    });
  
    it('should flatten an object and sort it\'s keys', function() {
      var flattened = nestedObjectsUtil.flatten({
        keyA: {
          keyE: [ 'value3', 'value4' ],
          keyF: null,
          keyD: 'value2',
          keyB: {
            keyC: 'value'
          }
        }
      }, true);
      var stringifiedFlattened = JSON.stringify(flattened);
      var stringifiedCompare = JSON.stringify({
        'keyA.keyB.keyC': 'value',
        'keyA.keyD': 'value2',
        'keyA.keyE.0': 'value3',
        'keyA.keyE.1': 'value4',
        'keyA.keyF': null
      });
      assert.equal(stringifiedFlattened === stringifiedCompare, true);
    });
  });

  describe('unflatten', function() {
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
  });

  describe('accessProperty', function() {
    it('should access object\'s nested property' , function() {
      var nestedObject = {
        keyA: {
          keyB: {
            keyC: 'value'
          }
        }
      };
      var accessedValue = nestedObjectsUtil.accessProperty('keyA.keyB.keyC', nestedObject);
      assert.equal(accessedValue, nestedObject.keyA.keyB.keyC);
    });
  
    it('should access object\'s nested property without providing parent parameter' , function() {
      global.object = {
        key: 'value'
      };
      var accessedValue = nestedObjectsUtil.accessProperty('object.key');
      assert.equal(accessedValue, global.object.key);
    });
  });

  describe('discardCircular', function() {
    it('should discard circular references', function() {
      var a = {
        b: 1
      };
      a.c = a;
      a.d = a.c;
      var string = nestedObjectsUtil.discardCircular(a, true);
      assert.equal(string, '{"b":1,"c":"~","d":"~"}');
      var object = nestedObjectsUtil.discardCircular(a);
      assert.deepEqual(object, {
        b: 1,
        c: '~',
        d: '~'
      });
    });
  });

  describe('filterValue', function() {
    it('should filter out all the keys with single value in the query', function() {
      var a = {
        b: {
          c: 'str',
          d: 'str2'
        },
        e: 'str',
        f: {
          g: {
            h: 'str',
            i: 'str3'
          },
          j: 'str4'
        },
        k: [ 'str', 'str2' ]
      };
      a.l = a.b;

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
        },
        k: [ 'str' ]
      });

      var filteredFlattened = nestedObjectsUtil.filterValue(a, 'str2', true);
      assert.deepEqual(filteredFlattened, {
        'b.d': 'str2',
        'k.1': 'str2'
      });
    });

    it('should filter out all the keys with several values in the query', function() {
      var a = {
        b: {
          c: 'str',
          d: 2
        },
        e: 'str',
        f: {
          g: {
            h: 'str',
            i: null
          },
          j: 'str4'
        },
        k: [ 'str', 2, 3, 'str4', null ]
      };
      a.l = a.b;

      var filtered = nestedObjectsUtil.filterValue(a, [ 2, 3, null ]);
      assert.deepEqual(filtered, {
        b: {
          d: 2
        },
        f: {
          g: {
            i: null
          }
        },
        k: [ , 2, 3, , null ]
      });
    });
  });

  describe('downloadStringified', function() {
    it('should return flattened, formatted and stringified json (no circular references)' , function() {
      var a = {
        b: 1,
        c: {
          d: 2,
          e: 2
        }
      };
      var obj = nestedObjectsUtil.discardCircular(a);
      var json = nestedObjectsUtil.downloadStringified(obj);
      assert.equal(json, '{\n  "b": 1,\n  "c": {\n    "d": 2,\n    "e": 2\n  }\n}');
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
      var obj = nestedObjectsUtil.discardCircular(a);
      var json = nestedObjectsUtil.downloadStringified(obj);
      assert.equal(json, '{\n  "b": 1,\n  "c": {\n    "d": 2,\n    "e": 2\n  },\n  "f": "~",\n  "g": "~"\n}');
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
      assert.equal(json, '{\n  "c.d": 2,\n  "c.e": 2\n}');
    });
  });

  describe('areObjectsEqual', function() {
    it('should compare two objects with same data, but different keys ordering and return true', function() {
      const objectA = {
        keyA: {
          keyB: {
            keyC: 'value'
          },
          keyD: 'value2',
          keyE: [ 'value3', 'value4' ]
        }
      };
      objectA.circular = objectA;
      const objectB = {
        keyA: {
          keyE: [ 'value3', 'value4' ],
          keyD: 'value2',
          keyB: {
            keyC: 'value'
          }
        }
      };
      objectB.circular = objectB;
      var result = nestedObjectsUtil.areObjectsEqual(objectA, objectB);
      assert.equal(result, true);
    });
  
    it('should compare two objects with different data and return false', function() {
      var result = nestedObjectsUtil.areObjectsEqual({
        keyA: {
          keyB: {
            keyC: 'value'
          },
          keyD: 'value2',
          keyE: [ 'value3', 'value4' ]
        }
      }, {
        keyA: {
          keyE: [ 'value3', 'value4' ],
          keyD: 'value2',
          keyB: {
            keyC: 'DIFFERENT_VALUE'
          }
        }
      });
      assert.equal(result, false);
    });
  });

  describe('getObjectsDiff', function() {
    it('should return sorted flatened diff properties between two objects' , function() {
      var a = {
        c: {
          d: 2,
          e: 1
        },
        f: null,
        b: 1,
      };
      var b = {
        b: 2,
        f: 'not null',
        c: {
          d: 2,
          e: 2
        }
      };
      var diff = nestedObjectsUtil.getObjectsDiff(a, b, true, true);
      assert.deepEqual(diff, {
        b: 2,
        'c.e': 2,
        f: 'not null'
      });
    });
  });

});