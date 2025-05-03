# Matx

Matx is a precision-safe math utility toolkit with deep object path support, ideal for financial and data aggregation tasks. It enhances JavaScript's native `Math` with precision-aware operations and introduces two object prototype extensions: `.pointer()` for safe nested access and `.scan()` for enumerable iteration.

## 🚀 Installation

```bash
npm install matx
```

## 📦 Usage

### In ES6 module:

```js
import 'matx';

const result = Math.sum(1.1, 2.22); // 3.32
```

### In Browser:

Include the bundled script and use `window.Matx`:

```html
<script src="matx.js" type="module"></script>
or
await import("/path/matx.js");
Math.acm(...)
```

## 🔧 Features

### 🔹 Math Methods

* `Math.sum(...values)` – Accumulates with precision.
* `Math.diff(a, b)` – Subtracts with precision.
* `Math.acm(acmObj, srcObj, keys)` – Accumulate fields from `srcObj` into `acmObj`.
* `Math.acms(...)` – Subtract version of `acm`.
* `Math.acmd(...)` – Divide version of `acm`.
* `Math.float0(x)` – Safe float parse.
* `Math.bytes(x)` – Converts bytes into human-readable units.
* `Math.precision(x, p, type)` – Applies fixed-point rounding.
* `Math.get_precision(x)` – Finds decimal precision of a number.

### 🔸 Object Extensions

#### `.pointer(path[, value])`

Access or set deeply nested properties safely.

```js
const obj = {};
obj.pointer("a.b.c", 42);
console.log(obj); // { a: { b: { c: 42 } } }
```

#### `.scan(callback)`

Iterates key-value pairs like `Array.prototype.map`.

```js
const o = { a: 10, b: 20 };
const keys = o.scan((k, v, i) => `${k}:${v}`);
console.log(keys); // ["a:10", "b:20"]
```

### Array.prototype.having()

This utility adds advanced filtering to arrays:

```js
const COL = [
  { a: 1, b: 2 },
  { a: 2, b: 1 },
  { a: 3, b: 1 },
  { a: 4, b: 5 },
  { a: 5, b: 5 },
  { a: 1, c: { d: 1, e: ["alfa"] } },
  { c: { d: 1, e: ["alfa", "beta"] } }
];

// Filter with object criteria
console.log(COL.having({ b: 5, a: 4 }, { a: [2, 3] }));

// Filter with JS condition expression
console.log(COL.having("${b} > 1 && ${a} > 4"));

// Filter with regex logic
console.log(COL.having("/^5/.test('${b}')"));

// Deep search using $@ pointer notation
console.log(COL.having("$@.c.e[1] !== undefined || $@.a > 2"));
```

## Examples

#### Object `.scan()` with `.pointer` Chaining

```js
const dataset = {
  101: { user: { id: 101, name: "Alice", scores: { math: 82 } } },
  102: { user: { id: 102, name: "Bob", scores: { math: 91 } } },
  103: { user: { id: 103, name: "Charlie", scores: { math: 75 } } }
};

const result = dataset.scan(function (key, value) {
  const name = value.pointer("user.name");
  const mathScore = value.pointer("user.scores.math");
  return `User ${name} scored ${mathScore} in math.`;
});

console.log(result);
// [
//   "User Alice scored 82 in math.",
//   "User Bob scored 91 in math.",
//   "User Charlie scored 75 in math."
// ]
```

#### `Math.acm` Aggregation Example

```js
const acm = { total: 0 };
const items = [
  { total: 10 },
  { total: 25 },
  { total: 5 }
];

Math.acm(acm, items, "total");
console.log(acm); // { total: 40 }
```

#### `Math.acm` with Nested Keys Example

```js
const acm = {};
const records = [
  {
    year_month: "2024-01",
    sales: { online: 100, retail: 200 },
    refunds: { online: 3, retail: 4 }
  },
  {
    year_month: "2024-02",
    sales: { online: 150, retail: 100 },
    refunds: { online: 2, retail: 5 }
  }
];

Math.acm(acm, records, [
  "sales.online",
  "sales.retail",
  "refunds.online",
  "refunds.retail"
]);

console.log(acm);
// {
//   sales: { online: 250, retail: 300 },
//   refunds: { online: 5, retail: 9 }
// }
```

### 🔍🧠 Why Matx?

* Zero-dependency
* Precision-safe
* Works with deeply nested objects
* Friendly to financial, scientific, or statistical data models

## 📄 License

MIT

---

## 🧠 Why Matx?

* Zero-dependency
* Precision-safe
* Works with deeply nested objects
* Friendly to financial, scientific, or statistical data models

## 📄 License

MIT
