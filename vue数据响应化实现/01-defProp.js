// 数组响应式
// 1、替换数组原型中7个方法
const orginalProto = Array.prototype;
// 备份一份，修改备份
const arrayProto = Object.create(orginalProto);
[("push", "pop", "shfit", "unshfit")].forEach((method) => {
  arrayProto[method] = function () {
    // 原始操作
    orginalProto[method].apply(this, arguments);
    // 覆盖操作，通知更新
    console.log("数组执行 " + method + "操作");
  };
});

// 对象响应式
function defineReactive(obj, key, val) {
  // 递归
  observe(val);

  // 对传入的值进行拦截
  Object.defineProperty(obj, key, {
    get() {
      console.log("get " + key + ":" + val);
      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log("set " + key + ":" + newVal);
        // 如果传入的newVal依旧是object，则要做响应化处理
        observe(newVal);
        val = newVal;
      }
    },
  });
}

// 判断传入的值是否是对象
function observe(obj) {
  if (typeof obj !== "object" || obj == null) {
    return;
  }

  // 判断传入的obj类型
  if (Array.isArray(obj)) {
    // 覆盖原型，替换变更操作
    obj.__proto__ = arrayProto;
    // 对数组内部元素执行响应化
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

function set(obj, key, val) {
  defineReactive(obj, key, val);
}

const obj = {
  foo: "foo",
  bar: "bar",
  obt: {
    a: 11,
  },
  arr: [1, 2, 3],
};
observe(obj);

obj.foo;
obj.foo = "fooo";
obj.bar;
obj.bar = "barrrrrr";
obj.obt = {
  a: 10,
};
obj.obt.a = 20;
set(obj, "dong", "dong");
obj.dong;
obj.arr.pop();
obj.arr;
