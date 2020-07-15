// 编译器
// 递归遍历dom树
// 判断节点类型，如果是文本，则判断是否是插值绑定
// 如果是元素，则遍历属性判断是否是指令或时间，然后递归子元素

class Compile {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);

    if (this.$el) {
      // 执行编译
      this.compile(this.$el);
    }
  }

  compile(el) {
    // 遍历dom树
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach((node) => {
      if (this.isElement(node)) {
        console.log("编译元素" + node.nodeName);
        this.compileElement(node)
      } else if (this.isInter(node)) {
        console.log("绑定插值元素" + node.textContent);
        this.compileText(node);
      }

      // 递归子节点
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node);
      }
    });
  }

  isElement(node) {
    return node.nodeType === 1;
  }
  isInter(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }

  compileText(node) {
    // node.textContent = this.$vm[RegExp.$1];
    this.update(node, RegExp.$1, 'text')
  }

  // 编译元素
  compileElement(node) {
    const nodeAttrs = node.attributes
    Array.from(nodeAttrs).forEach(attr => {
      const attrName = attr.name
      const exp = attr.value

      if (this.isDirective(attrName)) {
        const dir = attrName.substring(2)
        this[dir] && this[dir](node, exp)
      }

      if (this.isEvent(attrName)) {
        const dir = attrName.substring(1)
        this.eventHandler(node, exp, dir)
      }
    })
  }

  isDirective(attr) {
    return attr.indexOf('m-') === 0
  }

  isEvent(attr) {
    return attr.indexOf('@') === 0
  }

  eventHandler(node, exp, dir) {
    const fn = this.$vm.$options.methods && this.$vm.$options.methods[exp]
    node.addEventListener(dir, fn.bind(this.$vm))
  }

  update(node, exp, dir) {
    // 指令对应的更新函数xxUpdater
    // 初始化
    const fn = this[dir + 'Updater']
    fn && fn(node, this.$vm[exp])

    // 封装一个更新函数，可以更新对应dom元素
    new Watcher(this.$vm, exp, function (val) {
      fn && fn(node, val)
    })
  }

  textUpdater(node, value) {
    node.textContent = value
  }

  htmlUpdater(node, value) {
    node.innerHTML = value
  }

  modelUpdater(node, value) {
    // 表单元素赋值
    node.value = value
  }

  text(node, exp) {
    // node.textContent = this.$vm[exp]
    this.update(node, exp, 'text')
  }

  html(node, exp) {
    // node.innerHTML = this.$vm[exp]
    this.update(node, exp, 'html')

  }

  model(node, exp) {
    // update方法只完成赋值和更新
    this.update(node, exp, 'model')
    // 事件监听
    node.addEventListener('input', e => {
      this.$vm[exp] = e.target.value
    })
  }
}