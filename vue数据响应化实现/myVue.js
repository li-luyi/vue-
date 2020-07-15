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

  // 创建一个Dep和当前key一一对应
  const dep = new Dep()

  // 对传入的值进行拦截
  Object.defineProperty(obj, key, {
    get() {
      console.log("get " + key + ":" + val);

      // 依赖收集
      Dep.target && dep.addDep(Dep.target)

      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        console.log("set " + key + ":" + newVal);
        // 如果传入的newVal依旧是object，则要做响应化处理
        observe(newVal);
        val = newVal;

        // 通知更新
        // watchers.forEach(w => w.update())
        dep.notify()
      }
    },
  });
}

// 判断传入的值是否是对象
function observe(obj) {
  if (typeof obj !== "object" || obj == null) {
    return;
  }

  new Observer(obj)
}

// 代理函数，方便用户直接访问$data中的数据
function proxy(vm, sourceKey) {
  Object.keys(vm[sourceKey]).forEach(key => {
    Object.defineProperty(vm, key, {
      get() {
        return vm[sourceKey][key]
      },
      set(newVal) {
        vm[sourceKey][key] = newVal
      }
    })
  })
}

class MyVue {
  constructor(options) {
    // 保存数据
    this.$options = options
    this.$data = options.data

    // 响应化处理
    observe(this.$data)

    proxy(this, '$data')

    // 创建编译器实例
    new Compile(options.el, this)
  }

}


// 根据对象类型做响应化
class Observer {
  constructor(value) {
    this.$value = value

    // 判断类型
    if (typeof value === 'object') {
      this.walk(value)
    }
  }

  // 对象数组
  walk(obj) {
    // 判断传入的obj类型
    // if (Array.isArray(obj)) {
    //   // 覆盖原型，替换变更操作
    //   obj.__proto__ = arrayProto;
    //   // 对数组内部元素执行响应化
    //   const keys = Object.keys(obj);
    //   for (let i = 0; i < obj.length; i++) {
    //     observe(obj[i]);
    //   }
    // } else {
    //   Object.keys(obj).forEach((key) => {
    //     defineReactive(obj, key, obj[key]);
    //   });
    // }
    Object.keys(obj).forEach((key) => {
      defineReactive(obj, key, obj[key]);
    });
  }
}

// 观察者：保存更新函数，值发生变化调用更新函数
// const watchers = []
class Watcher {
  constructor(vm, key, updateFn) {
    this.vm = vm
    this.key = key
    this.updateFn = updateFn

    // watchers.push(this)

    // Dep.target静态属性上设置为当前watcher实例
    Dep.target = this
    this.vm[this.key]
    Dep.target = null
  }

  update() {
    this.updateFn.call(this.vm, this.vm[this.key])
  }
}

// Dep:依赖，管理相关Watcher相关的所有Watcher实例
class Dep {
  constructor() {
    this.deps = []
  }

  addDep(dep) {
    this.deps.push(dep)
  }
  notify() {
    this.deps.forEach(dep => dep.update())
  }
}