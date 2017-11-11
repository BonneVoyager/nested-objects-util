# nested-objects-util

A module to filter and diff huge nested objects having circular references.

It was implemented to filter out some values from huge nested objects with circular references and then diff them.

It's designed to work both on nodejs and browser.

## Installation

```
npm install --save nested-objects-util
```

## Usage

```js
const nestedObjectsUtil = require('nested-objects-util');
```

#### nestedObjectsUtil.flatten(Object: object, Boolean: sortKeysFlag = false): Object

Flatten object by keys composed from own nested properties.

```
nestedObjectsUtil.flatten({
  keyA: {
    keyE: [ 'value3', 'value4' ],
    keyF: null,
    keyD: 'value2',
    keyB: {
      keyC: 'value'
    }
  }
});
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

#### nestedObjectsUtil.unflatten(Object: object): Object

Unflatten object by keys composed from own nested properties.

```
nestedObjectsUtil.unflatten({
  'keyA.keyB.keyC': 'value',
  'keyA.keyD': 'value2'
});
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

#### nestedObjectsUtil.accessProperty(String | Array: keys, Object: parent = global | window): Various

Access object's nested property.

```
const nestedObject = {
  keyA: {
    keyB: {
      keyC: 'value'
    }
  }
};
nestedObjectsUtil.accessProperty('keyA.keyB.keyC', nestedObject);
```

returns:

```js
"value"
```

#### nestedObjectsUtil.discardCircular(Object: object, Boolean: stringifyFlag = false): Object | String

Discard circular references (to avoid "Converting circular structure to JSON" error).

```
const a = {
  b: 1
};
a.c = a;
nestedObjectsUtil.discardCircular(a)
```

returns:

```js
{
  "b": 1,
  "c": "~"
}
```

#### nestedObjectsUtil.filterValue(Object: object, Various | Array: query, Boolean: flattenFlag = false): Object

Filter a nested object by value or values (if array passed). Strict comparison is performed.

```
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
  k: [ 'str', 'str5' ]
};
a.l = a.b;
nestedObjectsUtil.filterValue(a, 'str');
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
  "k": [ "str" ]
}
```

or with flattenFlag = true

```js
nestedObjectsUtil.filterValue(a, 'str', true);
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

#### nestedObjectsUtil.downloadStringified(Object: object, Number: space = 2): String | undefined

On browser with HTML5 download API: stringify, format and download the object.

Else: return stringified text. 

```
const a = {
  b: 1,
  c: {
    d: 2,
    e: 2
  }
};
a.f = a;
a.g = a.f;
const obj = nestedObjectsUtil.discardCircular(a);
nestedObjectsUtil.downloadStringified(obj);
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

#### nestedObjectsUtil.areObjectsEqual(Object: objectA, Object: objectB): Boolean

Compare two objects against each other (by JSON.stringify) after discarding circular references, flattening and ordering keys.

```
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
nestedObjectsUtil.areObjectsEqual(objectA, objectB);
```

returns:

```js
true
```

#### nestedObjectsUtil.getObjectsDiff(Object: objectA, Object: objectB, Boolean: sortKeysFlag = false, Boolean: flattenFlag = false): Object

Get the properties which differ between object A and object B and return those from object B.

```
const objectA = {
  keyA: {
    keyB: {
      keyC: 'value'
    },
    keyD: 'value2',
    keyE: [ 'value3' ]
  }
};
objectA.circular = objectA;
const objectB = {
  keyA: {
    keyB: {
      keyC: 'value'
    },
    keyD: 'value2_CHANGED',
    keyE: [ 'value3_CHANGED' ]
  }
};
objectB.circular = objectB;
nestedObjectsUtil.getObjectsDiff(objectA, objectB);
```

returns:

```js
{
  "keyA": {
    "keyD": "value2_CHANGED",
    "keyE": [ "value3_CHANGED" ]
  }
}
```

## Example browser usage

In the browser, NestedObjectsUtil object should be exposed to either window or with AMD.

Filter out 'abcd' value from the flattened object and download stringified JSON via HTML5 API with:

```js
const object = NestedObjectsUtil.filterValue(App.SomeHugeObject, 'abcd', true);
NestedObjectsUtil.downloadStringified(object);
```

## Test

```
npm run test
```

## License

[MIT](LICENSE)
