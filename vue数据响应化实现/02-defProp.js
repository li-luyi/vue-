// 数组响应式
// 1、替换数组原型中7个方法
const orginalProto = Array.prototype;
// 备份一份，修改备份
const arrayProto = Object.create(orginalProto);
[("push", "pop", "shfit", "unshfit", "sort", "reverse", "splice")].forEach(
  (method) => {
    arrayProto[method] = function () {
      // 原始操作
      orginalProto[method].apply(this, arguments);
      // 覆盖操作，通知更新
      console.log("数组执行 " + method + "操作");
    };
  }
);

function defineReactive(obj, key, val) {
  observe(val);

  Object.defineProperty(obj, key, {
    get() {
      console.log("get " + key + ":" + val);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        observe(newVal);
        val = newVal;
        console.log("set " + key + ":" + val);
      }
    },
  });
}

function observe(obj) {
  if (typeof obj !== "object" || obj === null) {
    return;
  }

  if (Array.isArray(obj)) {
    obj.__proto__ = arrayProto;
    const keys = Object.keys(obj);
    for (let i = 0; i < obj.length; i++) {
      observe(obj[i]);
    }
  } else {
    Object.keys(obj).forEach((key) => {
      defineReactive(obj, key, obj[key]);
    });
  }
}

const obj = {
  a: "aa",
  foo: "foo",
  bat: { bb: "bbb" },
  arr: ["aa", { cc: "ccc" }],
};

observe(obj);

obj.foo;
obj.foo = "foooooooo";
obj.a;
// obj.bat.bb = "b";
obj.bat = { a: "a" };
obj.bat.a;
obj.bat.bb;
obj.arr.push("dd");
obj.arr;
