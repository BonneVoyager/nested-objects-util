# nested-objects-util

A minimalist inspection module to filter and diff complex nested objects having circular references.

It was implemented to filter out some values from inconveniently nested objects with circular references and then diff them.

It's designed to work both on nodejs and browser without any dependencies or additional polyfills.

Performance is currently not the key feature of this module, so please use more optimised libraries for e.g. deep equal.

## Installation

```
npm install --save nested-objects-util

yarn add nested-objects-util
```

Or just copy `index.min.js` into the console and start using `NestedObjectsUtil` object.

## Usage

```js
const nestedObjectsUtil = require('nested-objects-util')
```

#### nestedObjectsUtil.flatten(object: object, sortKeysFlag = false): object

Flatten object by keys composed from own nested properties.

```js
nestedObjectsUtil.flatten({
  keyA: {
    keyE: ['value3', 'value4'],
    keyF: null,
    keyD: 'value2',
    keyB: {
      keyC: 'value'
    }
  }
})
```

returns:

```js
{
  "keyA.keyE.0": "value3",
  "keyA.keyE.1": "value4",
  "keyA.keyF": null,
  "keyA.keyD": "value2",
  "keyA.keyB.keyC": "value"
}
```

with sortKeys=true it would return:

```js
{
  "keyA.keyB.keyC": "value",
  "keyA.keyD": "value2",
  "keyA.keyE.0": "value3",
  "keyA.keyE.1": "value4",
  "keyA.keyF": null
}
```

#### nestedObjectsUtil.unflatten(object: object): object

Unflatten object by keys composed from own nested properties.

```js
nestedObjectsUtil.unflatten({
  'keyA.keyB.keyC': 'value',
  'keyA.keyD': 'value2'
})
```

returns:

```js
{
  "keyA": {
    "keyB": {
      "keyC": "value"
    },
    "keyD": "value2"
  }
}
```

#### nestedObjectsUtil.accessProperty(keys: string|string[], parent = global window): any

Access object's nested property.

```js
const nestedObject = {
  keyA: {
    keyB: {
      keyC: 'value'
    }
  }
}
nestedObjectsUtil.accessProperty('keyA.keyB.keyC', nestedObject)
```

returns:

```js
"value"
```

#### nestedObjectsUtil.discardCircular(object: object, stringifyFlag = false): object|string

Discard circular references (to avoid "Converting circular structure to JSON" error).

```js
const a = {
  b: 1
}
a.c = a
nestedObjectsUtil.discardCircular(a)
```

returns:

```js
{
  "b": 1,
  "c": "~"
}
```

#### nestedObjectsUtil.filterValue(object: object, query: any|any[], flattenFlag = false): object

Filter a nested object by value or values (if array passed). Strict comparison is performed.

```js
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
  k: ['str', 'str5']
}
a.l = a.b
nestedObjectsUtil.filterValue(a, 'str')
```

returns:

```js
{
  "b": {
    "c": "str"
  },
  "e": "str",
  "f": {
    "g": {
      "h": "str"
    }
  },
  "k": ["str"]
}
```

or with flattenFlag = true

```js
nestedObjectsUtil.filterValue(a, 'str', true)
```

returns:

```js
{
  "b.c": "str",
  "e": "str",
  "f.g.h": "str",
  "k.0": "str"
}
```

#### nestedObjectsUtil.downloadStringified(object: object, space = 2): string|undefined

On browser with HTML5 download API: stringify, format and download the object.

Else: return stringified text.

```js
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
nestedObjectsUtil.downloadStringified(obj)
```

returns:

```js
{
  "b": 1,
  "c": {
    "d": 2,
    "e": 2
  },
  "f": "~",
  "g": "~"
}
```

#### nestedObjectsUtil.areObjectsEqual(objectA: object, objectB: object, skipProperties?: string[]): boolean

Compare two objects against each other after discarding circular references, flattening and ordering keys.

```js
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
nestedObjectsUtil.areObjectsEqual(objectA, objectB)
```

returns:

```js
true
```

It is also possible to skip certain properties when comparing the objects by providing an array to string properties.

```js
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
    keyB: {
      keyC: 'DIFFERENT_VALUE'
    },
    keyD: 'value2',
    keyE: ['value3', 'value4']
  }
}
objectB.circular = objectB
nestedObjectsUtil.areObjectsEqual(objectA, objectB, ['keyA.keyB.keyC'])
```

returns:

```js
true
```

#### nestedObjectsUtil.getObjectsDiff(objectA: object, objectB: object, sortKeysFlag = false, flattenFlag = false): object

Get the properties which differ between object A and object B and return only those from object B.

```js
const objectA = {
  keyA: {
    keyB: {
      keyC: 'value'
    },
    keyD: 'value2',
    keyE: ['value3']
  }
}
objectA.circular = objectA
const objectB = {
  keyA: {
    keyB: {
      keyC: 'value'
    },
    keyD: 'value2_CHANGED',
    keyE: ['value3_CHANGED']
  }
}
objectB.circular = objectB
nestedObjectsUtil.getObjectsDiff(objectA, objectB)
```

returns:

```js
{
  "keyA": {
    "keyD": "value2_CHANGED",
    "keyE": ["value3_CHANGED"]
  }
}
```

## Example browser usage

In the browser, NestedObjectsUtil object is exposed either to window or with AMD.

Filter out 'abcd' value from the flattened object and download stringified JSON via HTML5 API with:

```js
const object = NestedObjectsUtil.filterValue(App.SomeHugeObject, 'abcd', true)
NestedObjectsUtil.downloadStringified(object)
```

Discar circular references from the object, then flatten and download it.

```js
let object = NestedObjectsUtil.discardCircular(App.SomeHugeObject)
object = NestedObjectsUtil.flatten(object)
NestedObjectsUtil.downloadStringified(object)
```

## Test

```
npm run test

yarn test
```

## License

[MIT](LICENSE)
