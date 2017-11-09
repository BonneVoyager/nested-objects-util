# nested-objects-util

A module to work with huge nested objects having circular references.

It was implemented to filter out some values from huge nested objects with circular references.

It's designed to work both on nodejs and browser.

## Installation

```
npm install --save nested-objects-util
```

## Usage

```js
const nestedObjectsUtil = require('nested-objects-util');
```

#### nestedObjectsUtil.flatten(Object: object): Object

Flatten object by keys composed from own nested properties.

```
nestedObjectsUtil.flatten({
  keyA: {
    keyB: {
      keyC: 'value'
    },
    keyD: 'value2'
  },
  keyE: [ 'value3', 'value4' ]
})
```

returns:

```js
{
  "keyA.keyB.keyC": "value",
  "keyA.keyD": "value2",
  "keyA.keyE.0": "value3",
  "keyA.keyE.1": "value4"
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
var nestedObject = {
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

#### nestedObjectsUtil.discardCircular(Object: object): Object

Discard circular references (to avoid "Converting circular structure to JSON" error).

```
var a = {
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

#### nestedObjectsUtil.filterValue(Object: object, Various: query, Boolean: flattenFlag = false): Object

Filter a nested object by value (with strict comparison performed).

```
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
  }
};
a.k = a.b;
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
  }
}
```

or

```js
nestedObjectsUtil.filterValue(a, 'str', true);
```

returns:

```js
{
  "b.c": "str",
  "e": "str",
  "f.g.h": "str"
}
```

#### nestedObjectsUtil.downloadStringified(Object: object, Number: space = 2): String | undefined

On browser with HTML5 download API: stringify, format and download the object.

Else: return stringified text. 

```
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

## Example browser usage

Filter out 'abcd' value from the flattened object and download stringified json via HTML5 API with:

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
