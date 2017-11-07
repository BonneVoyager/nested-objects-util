# nested-objects-util

A module to work with huge nested objects having circular dependencies.

It was implemented to filter out some values from huge nested objects with circular references both from nodejs and browser.

## Installation

```
npm install --save nested-objects-util
```

## Usage

```js
const nestedObjectsUtil = require('nested-objects-util');
```

#### nestedObjectsUtil.flatten(Object: object) returns {Object}

Flatten object by keys composed from own nested properties.

```
nestedObjectsUtil.flatten({
  keyA: {
    keyB: {
      keyC: 'value'
    },
    keyD: 'value2'
  } 
})
```

returns:

```js
{
  "keyA.keyB.keyC": "value",
  "keyA.keyD": "value2"
}
```

#### nestedObjectsUtil.unflatten(Object: object) returns {Object}

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

#### nestedObjectsUtil.accessProperty([String | Array]: keys, Object: parent = global | window) returns {Various}

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
value
```

#### nestedObjectsUtil.discardCircular(Object: object) returns {Object}

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

#### nestedObjectsUtil.filterValue(Object: object, String: query, Boolean: flattenFlag = false) returns {Object}

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
  e: "str",
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

## Browser usage

Module can be used in the browser as well.

Filter and download some huge object via HTML5 API (if supported) with:

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
