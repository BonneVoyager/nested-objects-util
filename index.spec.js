const assert = require('assert')
const nestedObjectsUtil = require('./')

describe('nested-objects-util', () => {

  describe('flatten', () => {
    it('should flatten an object', () => {
      const flattened = nestedObjectsUtil.flatten({
        keyA: {
          keyE: ['value3', 'value4'],
          keyF: null,
          keyD: 'value2',
          keyB: {
            keyC: 'value'
          }
        }
      })
      const stringifiedFlattened = JSON.stringify(flattened)
      const stringifiedCompare = JSON.stringify({
        'keyA.keyE.0': 'value3',
        'keyA.keyE.1': 'value4',
        'keyA.keyF': null,
        'keyA.keyD': 'value2',
        'keyA.keyB.keyC': 'value'
      })
      assert.equal(stringifiedFlattened === stringifiedCompare, true)
    })
  
    it('should flatten an object and sort it\'s keys', () => {
      const flattened = nestedObjectsUtil.flatten({
        keyA: {
          keyE: ['value3', 'value4'],
          keyF: null,
          keyD: 'value2',
          keyB: {
            keyC: 'value'
          }
        }
      }, true)
      const stringifiedFlattened = JSON.stringify(flattened)
      const stringifiedCompare = JSON.stringify({
        'keyA.keyB.keyC': 'value',
        'keyA.keyD': 'value2',
        'keyA.keyE.0': 'value3',
        'keyA.keyE.1': 'value4',
        'keyA.keyF': null
      })
      assert.equal(stringifiedFlattened === stringifiedCompare, true)
    })
  })

  describe('unflatten', () => {
    it('should unflatten an object', () => {
      const unflattened = nestedObjectsUtil.unflatten({
        'keyA.keyB.keyC': 'value',
        'keyA.keyD': 'value2'
      })
      assert.deepEqual(unflattened, {
        keyA: {
          keyB: {
            keyC: 'value'
          },
          keyD: 'value2'
        }
      })
    })

    it('should prevent prototype pollution on unflattening an object', () => {
      const unflattened = nestedObjectsUtil.unflatten({
        "__proto__.polluted": "Yes! Its Polluted"
      })
      assert.deepEqual(unflattened, {
        polluted: "Yes! Its Polluted"
      })
      assert.notEqual({}.polluted, "Yes! Its Polluted")
      assert.equal({}.polluted, undefined)
    })
  })

  describe('accessProperty', () => {
    it('should access object\'s nested property', () => {
      const nestedObject = {
        keyA: {
          keyB: {
            keyC: 'value'
          }
        }
      }
      const accessedValue = nestedObjectsUtil.accessProperty('keyA.keyB.keyC', nestedObject)
      assert.equal(accessedValue, nestedObject.keyA.keyB.keyC)
    })
  
    it('should access object\'s nested property without providing parent parameter', () => {
      global.object = {
        key: 'value'
      }
      const accessedValue = nestedObjectsUtil.accessProperty('object.key')
      assert.equal(accessedValue, global.object.key)
    })
  })

  describe('discardCircular', () => {
    it('should discard circular references', () => {
      const a = {
        b: 1
      }
      a.c = a
      a.d = a.c
      const string = nestedObjectsUtil.discardCircular(a, true)
      assert.equal(string, '{"b":1,"c":"~","d":"~"}')
      const object = nestedObjectsUtil.discardCircular(a)
      assert.deepEqual(object, {
        b: 1,
        c: '~',
        d: '~'
      })
    })
  })

  describe('filterValue', () => {
    it('should filter out all the keys with single value in the query', () => {
      const a = {
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
        k: ['str', 'str2']
      }
      a.l = a.b

      const filtered = nestedObjectsUtil.filterValue(a, 'str')
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
        k: ['str']
      })

      const filteredFlattened = nestedObjectsUtil.filterValue(a, 'str2', true)
      assert.deepEqual(filteredFlattened, {
        'b.d': 'str2',
        'k.1': 'str2'
      })
    })

    it('should filter out all the keys with several values in the query', () => {
      const a = {
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
        k: ['str', 2, 3, 'str4', null]
      }
      a.l = a.b

      const filtered = nestedObjectsUtil.filterValue(a, [2, 3, null])
      assert.deepEqual(filtered, {
        b: {
          d: 2
        },
        f: {
          g: {
            i: null
          }
        },
        k: [, 2, 3, , null]
      })
    })
  })

  describe('downloadStringified', () => {
    it('should return flattened, formatted and stringified json (no circular references)', () => {
      const a = {
        b: 1,
        c: {
          d: 2,
          e: 2
        }
      }
      const obj = nestedObjectsUtil.discardCircular(a)
      const json = nestedObjectsUtil.downloadStringified(obj)
      assert.equal(json, '{\n  "b": 1,\n  "c": {\n    "d": 2,\n    "e": 2\n  }\n}')
    })
  
    it('should return flattened, formatted and stringified json (circular references)', () => {
      const a = {
        b: 1,
        c: {
          d: 2,
          e: 2
        }
      }
      a.f = a
      a.g = a.f
      const obj = nestedObjectsUtil.discardCircular(a)
      const json = nestedObjectsUtil.downloadStringified(obj)
      assert.equal(json, '{\n  "b": 1,\n  "c": {\n    "d": 2,\n    "e": 2\n  },\n  "f": "~",\n  "g": "~"\n}')
    })
  
    it('should return filtered, flattened, formatted and stringified json (circular references)', () => {
      const a = {
        b: 1,
        c: {
          d: 2,
          e: 2
        }
      }
      a.f = a
      const filtered = nestedObjectsUtil.filterValue(a, 2, true)
      const json = nestedObjectsUtil.downloadStringified(filtered)
      assert.equal(json, '{\n  "c.d": 2,\n  "c.e": 2\n}')
    })
  })

  describe('areObjectsEqual', () => {
    it('should compare two objects with same data, but different keys ordering and return true', () => {
      const objectA = {
        keyA: {
          keyB: {
            keyC: 'value'
          },
          keyD: 'value2',
          keyE: ['value3', 'value4']
        }
      }
      objectA.circular = objectA
      const objectB = {
        keyA: {
          keyE: ['value3', 'value4'],
          keyD: 'value2',
          keyB: {
            keyC: 'value'
          }
        }
      }
      objectB.circular = objectB
      const result = nestedObjectsUtil.areObjectsEqual(objectA, objectB)
      assert.equal(result, true)
    })
  
    it('should compare two objects with different data and return false', () => {
      const result = nestedObjectsUtil.areObjectsEqual({
        keyA: {
          keyB: {
            keyC: 'value'
          },
          keyD: 'value2',
          keyE: ['value3', 'value4']
        }
      }, {
        keyA: {
          keyE: ['value3', 'value4'],
          keyD: 'value2',
          keyB: {
            keyC: 'DIFFERENT_VALUE'
          }
        }
      })
      assert.equal(result, false)
    })

    it('should compare two objects with different data but return true because of skipped property', () => {
      const result = nestedObjectsUtil.areObjectsEqual({
        keyA: {
          keyB: {
            keyC: 'value'
          },
          keyD: 'value2',
          keyE: ['value3', 'value4']
        }
      }, {
        keyA: {
          keyB: {
            keyC: 'DIFFERENT_VALUE'
          },
          keyD: 'value2',
          keyE: ['value3', 'value4']
        }
      }, ['keyA.keyB.keyC'])
      assert.equal(result, true)
    })
  })

  describe('getObjectsDiff', () => {
    it('should return sorted flatened diff properties between two objects', () => {
      const a = {
        c: {
          d: 2,
          e: 1
        },
        f: null,
        b: 1,
      }
      const b = {
        b: 2,
        f: 'not null',
        c: {
          d: 2,
          e: 2
        }
      }
      const diff = nestedObjectsUtil.getObjectsDiff(a, b, true, true)
      assert.deepEqual(diff, {
        b: 2,
        'c.e': 2,
        f: 'not null'
      })
    })

    it('should return array diffs', () => {
      const a = {
        a: [1],
        b: []
      }
      const b = {
        a: [2],
        b: []
      }
      const diff = nestedObjectsUtil.getObjectsDiff(a, b, true, true)
      assert.deepEqual(diff, {
        'a.0': 2
      })
    })

    it('should return an empty object in case of comparing the same object and not flattening', () => {
      const a = {
        a: {
          b: [1, 2, 3]
        }
      }
      const diff = nestedObjectsUtil.getObjectsDiff(a, a)
      assert.deepEqual(diff, {})
    })
  })

})
