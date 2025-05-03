// Safe Object.prototype.pointer
const byte_units = ["b", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

if (!Object.prototype.pointer) {
    Object.defineProperty(Object.prototype, "pointer", {
        value: function (path, value) {
            if (!path) return undefined;
            const set = arguments.length === 2;
            const keys = path.split(".");
            let o = this;
            for (let i = 0; i < keys.length; i++) {
                const k = keys[i];
                if (i === keys.length - 1) {
                    if (set) o[k] = value;
                    return o[k];
                }
                if (!o.hasOwnProperty(k) || typeof o[k] !== "object") {
                    if (set) o[k] = {};
                    else return undefined;
                }
                o = o[k];
            }
        },
        configurable: true,
        writable: true
    });
}

// like map from array
if (!Object.prototype.scan) {
    Object.defineProperty(Object.prototype, "scan", {
        value: function (cb) {
            return Object.entries(this).map(([k, v], idx) => {
                return cb.bind(this)(k, v, idx);
            });
        },
        configurable: true,
        writable: true,
    });
}

Array.prototype.having && Object.defineProperty(Array.prototype, "having", {
    value: function (...A) {
        var selected = [];
        for (var i in A) {
            var o = A[i];
            for (var v in this) {
                try {
                    var bool = true,
                        set = this[v];

                    if (typeof o === "string") {
                        if (/\$@/.test(o)) {
                            // Function -- DEEP SEARCH
                            var str = o.replace(/(\$@)([^\s=<>!\)]*)/gim, function (p, i, j) {
                                var a = j.match(/[^\.\[\]]+/gim);
                                return " _x_" + (a.length ? ".pointer(" + JSON.stringify(a) + ")" : "");
                            });
                            bool = new Function("_x_", "return " + str)(set);
                        } else {
                            // eval with regex
                            var str = o.replace(/\$\{(.*?)\}/gim, function (p, i) {
                                return set[i];
                            });
                            bool = eval(str);
                        }
                    } else {
                        if (this[v] === null) {
                            bool = false;
                        } else {
                            for (var p in o) {
                                if (typeof o[p] !== "object" ? this[v][p] != o[p] : !o[p].has(this[v][p])) {
                                    // p:1 <-> p:[1,2]  !!!BAC>>> type_agnostic == not  ===
                                    bool = false;
                                    break;
                                }
                            }
                        }
                    }

                    if (bool) {
                        selected.push(this[v]);
                    }
                } catch (e) {
                    console.log("INPUT:", o, "\nCOND:", A, "\n", e);
                }
            }
        }
        return selected;
    },
    configurable: true,
    writable: true
});



// Define all Matx methods as non-enumerable properties on Math
Object.defineProperties(Math, {
    scientific_to_num: {
        value(num) {
            if (/e/i.test(num)) {
                const [coeff, exp] = String(num).toLowerCase().split("e");
                const e = +exp;
                const sign = e < 0 ? -1 : 1;
                const l = Math.abs(e);
                const parts = coeff.split(".");
                if (sign === -1) {
                    return "0." + "0".repeat(l) + parts.join("");
                } else {
                    const decimals = parts[1] || "";
                    const zeros = l - decimals.length;
                    return parts[0] + decimals + "0".repeat(zeros);
                }
            }
            return num;
        },
        enumerable: false
    },

    precision: {
        value(val, prec = 0, type = "round") {
            const p = Math.max(prec, 0);
            return (Math[type](parseFloat(val) * 10 ** p) / 10 ** p).toFixed(p);
        },
        enumerable: false
    },

    get_precision: {
        value(num) {
            const s = Math.scientific_to_num(String(num)).split(".");
            return s[1] ? s[1].length : 0;
        },
        enumerable: false
    },

    max_precision: {
        value(...args) {
            return args.reduce((m, x) => Math.max(m, Math.get_precision(x)), 0);
        },
        enumerable: false
    },

    sum: {
        value(...args) {
            let p = 0, t = 0;
            for (const x of args) {
                p = Math.max(p, Math.get_precision(x));
                t += parseFloat(x) || 0;
            }
            return +Math.precision(t, p);
        },
        enumerable: false
    },

    diff: {
        value(a, b) {
            const p = Math.max(Math.get_precision(a), Math.get_precision(b));
            return +Math.precision(a - b, p);
        },
        enumerable: false
    },

    acm: {
        value(acm, src, keys = []) {
            if (Array.isArray(src) && typeof src[0] === "object") {
                src.forEach(item => Math.acm(acm, item, keys));
                return acm;
            }
            const K = Array.isArray(keys) ? keys : keys === "*" ? Object.keys(src) : [keys];
            K.forEach(k => {
                const v = Math.sum(acm.pointer(k), src.pointer(k));
                acm.pointer(k, v);
            });
            return acm;
        },
        enumerable: false
    },

    acms: {
        value(acm, src, keys = []) {
            if (Array.isArray(src) && typeof src[0] === "object") {
                src.forEach(item => Math.acms(acm, item, keys));
                return acm;
            }
            const K = Array.isArray(keys) ? keys : keys === "*" ? Object.keys(src) : [keys];
            K.forEach(k => {
                const v = Math.diff(acm.pointer(k), src.pointer(k));
                acm.pointer(k, v);
            });
            return acm;
        },
        enumerable: false
    },

    acmd: {
        value(acm, src, keys = []) {
            if (Array.isArray(src) && typeof src[0] === "object") {
                src.forEach(item => Math.acmd(acm, item, keys));
                return acm;
            }
            const K = Array.isArray(keys) ? keys : keys === "*" ? Object.keys(src) : [keys];
            K.forEach(k => {
                const n = parseFloat(acm.pointer(k)) || 0;
                const d = parseFloat(src.pointer(k)) || 1;
                const r = d === 0 ? 0 : n / d;
                acm.pointer(k, +Math.precision(r, Math.get_precision(r)));
            });
            return acm;
        },
        enumerable: false
    },

    float0: {
        value(x) {
            return parseFloat(typeof x === "string" ? x.replace(/,/g, "") : x) || 0;
        },
        enumerable: false
    },

    rad2deg: {
        value(r) {
            return (r * 180) / Math.PI;
        },
        enumerable: false
    },

    deg2rad: {
        value(d) {
            return (d * Math.PI) / 180;
        },
        enumerable: false
    },

    bytes: {
        value(x) {
            let i = 0, n = parseInt(x, 10) || 0;
            while (n >= 1024 && ++i) n = n / 1024;
            return n.toFixed(n < 10 && i > 0 ? 1 : 0) + " " + ["B", "KB", "MB", "GB", "TB"][i];
        },
        enumerable: false
    }
});

