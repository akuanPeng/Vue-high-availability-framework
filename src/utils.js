export default {
    /**
     * 将一级的数据结构处理成树状数据结构
     * @param {Object} obj {key, pKey, data}
     * @param obj.key  字段名称 比如id
     * @param obj.pKey 父字段名称 比如 pid
     * @param obj.rootPValue 根节点的父字段的值
     * @param obj.data 需要处理的数据
     * @param obj.jsonData 是否深复制数据（默认是true）
     * @return {Array} arr
     */
    getTreeArr: obj => {
        if (!Array.isArray(obj.data)) {
            console.log('getTreeArr=>请传入数组')
            return []
        }
        obj.jsonData = obj.jsonData === false ? obj.jsonData : true
        const arr = obj.jsonData
            ? JSON.parse(JSON.stringify(obj.data))
            : obj.data
        const arr1 = []
        // 将数据处理成数状结构
        arr.forEach(item => {
            let index = 0
            item.children = []
            if (obj.key) item.value = parseInt(item[obj.key])
            if (obj.text) item.label = item[obj.text]
            arr.forEach(item1 => {
                // 得到树结构关系
                if (item[obj.key] === item1[obj.pKey]) {
                    item.children.push(item1)
                }
                // 判断根节点
                if (item1[obj.key] !== item[obj.pKey]) {
                    index++
                }
            })
            // 没传入根节点，根据当前数据结构得到根节点
            if (!('rootPValue' in obj) && index === arr.length) {
                arr1.push(item)
            }
        })
        // 传入根节点，根据传入的根节点组成树结构
        if ('rootPValue' in obj) {
            arr.forEach(item => {
                if (item[obj.pKey] === obj.rootPValue) {
                    arr1.push(item)
                }
            })
        }
        return arr1
    },
    /**
     * 复制
     * @param {String} value 要复制的值
     */
    copyData (value) {
        if (typeof document === 'undefined') return
        const inputDom = document.createElement('input')
        inputDom.value = value
        document.body.appendChild(inputDom)
        inputDom.select() // 选择对象
        document.execCommand('Copy') // 执行浏览器复制命令
        document.body.removeChild(inputDom) // 删除DOM
    },
    // 向上查找
    filtersClassName (dm, clname) {
        do {
            if (dm.className === clname) {
                return true
            }
            dm = dm.parentNode
        } while (dm)
        return false
    },
    // 字符串前后截取，中间补省略号
    startSubStrEnd (str, start, end) {
        const len = start + end + 3
        if (str && str.length > len) {
            return (
                str.substr(0, start) +
                '...' +
                str.substr(str.length - end, end + 1)
            )
        } else {
            return str
        }
    },
    guid () {
        function S4 () {
           return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
        }
        return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
    },
    // 日期格式化
    formatDate (date, fmt) {
        if ((typeof date) === 'string') {
            date = new Date(date)
        }
        let o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds(),
            'q+': Math.floor((date.getMonth() + 3) / 3),
            S: date.getMilliseconds()
        }
        fmt = /(y+)/.test(fmt)
            ? fmt.replace(
                  RegExp.$1,
                  (date.getFullYear() + '').substr(4 - RegExp.$1.length)
              )
            : fmt
        for (let k in o) {
            fmt = new RegExp('(' + k + ')').test(fmt)
                ? fmt.replace(
                      RegExp.$1,
                      RegExp.$1.length === 1
                          ? o[k]
                          : ('00' + o[k]).substr(('' + o[k]).length)
                  )
                : fmt
        }
        return fmt
    },
    // 添加编辑补行
    rowsHtml (h, rows) {
        return h(
            'div',
            rows.map(rs =>
                h(
                    'Row',
                    {
                        props: {
                            'class-name': 'row-info'
                        }
                    },
                    rs.map((r, i) =>
                        h(
                            'Col',
                            {
                                class: i % 2 === 1 ? '' : 'row-label',
                                props: {
                                    span: r[0]
                                },
                                style: {
                                    'text-align': r[1] === '-' ? 'center' : ''
                                }
                            },
                            r[1]
                        )
                    )
                )
            )
        )
    },
    // 获得图片对象
    getImg (url, cb) {
        let img = new Image()
        img.src = url
        img.onload = () => cb(img)
    },
    // 返回值浮点化
    returnFloat (value) {
        value = Math.round(parseFloat(value) * 100) / 100
        let xsd = value.toString().split('.')
        if (xsd.length === 1) {
            value = value.toString() + '.00'
            return value
        }
        if (xsd.length > 1) {
            if (xsd[1].length < 2) {
                value = value.toString() + '0'
            }
            return value
        }
    },
    // 弹出层项
    itemDom (h, cfg, item, i) {
        return [
            h('Col', { class: 'row-label', props: { span: cfg.cols[i] } }, [
                item.required ? h('span', {
                    style: {
                        color: '#ed4014'
                    }
                }, '* ') : '',
                typeof item.label === 'string' ? (item.label || '') : ((obj) => {
                    for (let key in obj) {
                        return obj[key][cfg.data[key]]
                    }
                })(item.label)
            ]),
            h('Col', { class: cfg.verify[item.key] ? 'ivu-form-item-error' : '', props: { span: item.col ? item.col : cfg.cols[i + 1] }, style: { paddingRight: item.unit ? '34px' : '0' } }, [
                (type => {
                    switch (type) {
                        case 'ribbon':
                            return item.render ? item.render(h, {
                                value: cfg.data[item.key],
                                data: cfg.data
                            }) : ''
                        case 'selectTree':
                            return h('akSelectTree', {
                                props: {
                                    placeholder: item.label || '',
                                    name: item.name,
                                    selectedItems: cfg.data[item.key],
                                    data: item.options,
                                    multiple: item.multiple,
                                    titleKey: 'depName',
                                    cache: item.cache || {},
                                    clearable: !item.multiple,
                                    childrenKey: 'subDepList',
                                    mKey: 'depId'
                                },
                                on: {
                                    'on-selected': (selected, titles) => {
                                        cfg.verify[item.key] = ''
                                        cfg.data[item.key] = selected
                                        if (item.change) item.change(titles)
                                    }
                                }
                            }, [])
                        case 'text':
                            return h('Input', {
                                props: {
                                    value: cfg.data[item.key] || '',
                                    placeholder: typeof item.label === 'string' ? (item.label || '') : ((obj) => {
                                        for (let key in obj) {
                                            return obj[key][cfg.data[key]]
                                        }
                                    })(item.label),
                                    disabled: item.disabled || false,
                                    readonly: !!item.isadd
                                },
                                on: {
                                    'on-change': e => {
                                        cfg.verify[item.key] = ''
                                        cfg.data[item.key] = e.target.value
                                        if (item.change) item.change(e.target.value)
                                    }
                                }
                            }, item.isadd ? [
                                h('Button', {
                                    slot: 'append',
                                    props: {
                                        icon: 'plus'
                                    },
                                    on: {
                                        click: () => {
                                            item.isaddFunc(cfg.data)
                                        }
                                    }
                                })
                            ] : [])
                        case 'number':
                            return h('InputNumber', {
                                props: {
                                    value: cfg.data[item.key] || 0,
                                    min: item.min,
                                    ...(item.max ? {
                                        max: item.max
                                    } : {}),
                                    step: item.step || 1,
                                    ...(item.precision ? {
                                        precision: item.precision
                                    } : {})
                                },
                                on: {
                                    'on-change': v => {
                                        cfg.verify[item.key] = ''
                                        cfg.data[item.key] = v
                                        if (item.change) item.change(v)
                                    }
                                },
                                style: {
                                    width: '100%'
                                }
                            })
                        case 'textarea':
                            return h('Input', {
                                class: 'resize_none',
                                props: {
                                    value: cfg.data[item.key] || '',
                                    placeholder: item.placeholder || (item.label || ''),
                                    disabled: item.disabled || false,
                                    type: 'textarea',
                                    rows: item.rows,
                                    maxlength: item.maxlength
                                },
                                on: {
                                    'on-change': e => {
                                        cfg.verify[item.key] = ''
                                        cfg.data[item.key] = e.target.value
                                    }
                                }
                            })
                        case 'select':
                            // 子选项
                            let options = (item.optionsKey ? (typeof cfg.name === 'string' ? vm.$store.state[cfg.name].paramCfg[item.optionsKey] : cfg.name[item.optionsKey]) : item.options)
                            if (options.constructor === Array) {
                                options = options.map((_, index) => h('Option', {
                                    props: {
                                        key: index,
                                        value: _.value,
                                        title: _.title || ''
                                    }
                                }, _.label))
                            } else {
                                let optionGroups = []
                                for (let label in options) {
                                    let optionGroup = []
                                    for (let i = 0, ilen = options[label].length; i < ilen; i++) {
                                        optionGroup.push(h('Option', {
                                            props: {
                                                key: i,
                                                value: options[label][i].value
                                            }
                                        }, options[label][i].label))
                                    }
                                    optionGroups.push(h('OptionGroup', {
                                        props: {
                                            label
                                        }
                                    }, optionGroup))
                                }
                                options = optionGroups
                            }
                            return h('Select', {
                                class: item.class,
                                props: {
                                    value: cfg.data[item.key] || (item.multiple ? [] : (item.def ? 0 : '')),
                                    placeholder: item.label || '',
                                    filterable: item.filterable || false,
                                    clearable: item.clearable || false,
                                    disabled: item.disabled || false,
                                    multiple: item.multiple || false
                                },
                                on: {
                                    'on-change': v => {
                                        cfg.verify[item.key] = ''
                                        cfg.data[item.key] = v
                                        if (item.change) item.change(v)
                                    },
                                    'on-query-change': v => {
                                        if (item.queryChange) {
                                            vm.$store.state[cfg.name].paramCfg[item.optionsKey] = item.queryChange(v)
                                        }
                                    }
                                }
                            }, options)
                        case 'dataTime':
                            return h('DatePicker', {
                                props: {
                                    value: cfg.data[item.key] || '',
                                    type: item._type || 'datetime',
                                    placeholder: item.label || ''
                                },
                                on: {
                                    'on-change': v => {
                                        cfg.verify[item.key] = ''
                                        cfg.data[item.key] = v
                                    }
                                },
                                style: {
                                    width: '100%'
                                }
                            })
                        case 'time':
                            return h('TimePicker', {
                                props: {
                                    value: cfg.data[item.key] || '',
                                    format: item.format,
                                    placeholder: item.label || '',
                                    clearable: item.clearable
                                },
                                on: {
                                    'on-change': v => {
                                        cfg.verify[item.key] = ''
                                        cfg.data[item.key] = v
                                    }
                                },
                                style: {
                                    width: '100%'
                                }
                            })
                        case 'user':
                            let optionsAll = [...(item.page.paramCfg.users || [])]
                            if (item.def && !optionsAll.length) {
                                optionsAll.push(item.def)
                            }
                            return h('Select', {
                                props: {
                                    value: cfg.data[item.key] || '',
                                    loading: item.page.paramCfg.loading,
                                    placeholder: item.placeholder || item.label,
                                    filterable: true,
                                    clearable: item.clearable === undefined ? true : item.clearable,
                                    remote: true,
                                    remoteMethod: item.remoteMethod,
                                    disabled: item.disabled || false,
                                    multiple: item.multiple || false
                                },
                                on: {
                                    'on-change': v => {
                                        cfg.verify[item.key] = ''
                                        cfg.data[item.key] = v
                                        if (item.change) item.change(v)
                                    }
                                }
                            }, optionsAll.map(_ => {
                                return h('Option', {
                                    props: {
                                        key: _.newJobNumber,
                                        value: _.newJobNumber + ' ' + _.userName
                                    }
                                }, `${_.userName} (${_.newJobNumber})`)
                            }))
                    }
                })(item.type),
                ...(item.unit ? [
                    h('div', {
                        style: {
                            position: 'absolute',
                            top: '1px',
                            right: '0',
                            width: '34px',
                            textAlign: 'center',
                            border: '1px solid #e9eaec',
                            borderLeft: '0',
                            height: '32px',
                            background: '#f8f8f9',
                            ...(item.unitStyle || {})
                        },
                        on: {
                            click: () => {
                                if (item.callback) item.callback()
                            }
                        }
                    }, item.unit)
                ] : []),
                h('span', {
                    class: 'row-form-info'
                }, cfg.verify[item.key]),
                h('span', {
                    class: `row-form-value ${item.max ? '' : 'hide'}`
                }, `${cfg.data[item.key] || 0}/${item.max}`)
            ])
        ]
    },
    // 是否显示
    isShow (shows, data) {
        for (let key in shows) {
            if (shows[key].constructor === Array) {
                if (shows[key].indexOf(data[key]) === -1) return false
            } else if (shows[key].constructor === Object) {
                if (shows[key].type === '!' && shows[key].value.indexOf(data[key]) !== -1) return false
            } else {
                if (shows[key] !== data[key]) return false
            }
        }
        return true
    },
    showM (opt) {
        if (opt === vm.$store.state.mx) {
            return {
                info: () => {},
                success: () => {},
                warning: () => {},
                error: () => {},
                confirm: () => {}
            }
        } else {
            vm.$store.state.mx = opt
            clearTimeout(vm.$store.state.bl)
            vm.$store.state.bl = setTimeout(() => {
                vm.$store.state.mx = ''
            }, 2000)
            return vm.$Modal
        }
    },
    // 弹出层UI生成
    showModal (type, cfg, onOk, onOk2) {
        if (cfg.content) {
            return vm.$Modal[type]({
                title: '系统提醒！',
                width: cfg.width || '360px',
                styles: cfg.styles || {},
                content: cfg.content,
                okText: cfg.okText || '确定',
                cancelText: '取消',
                closable: cfg.closable || false,
                onOk,
                onCancel: onOk2
            })
        }
        if (cfg.verify_def) {
            for (let key in cfg.verify_def) {
                cfg.verify[key] = cfg.verify_def[key]
            }
        } else {
            cfg.verify = {}
        }
        for (let key in cfg.data_def) {
            cfg.data[key] = cfg.data_def[key]
        }
        this.showM(cfg.title || 'test')[type]({
            title: cfg.title || '',
            width: cfg.width || '500px',
            styles: cfg.styles || {},
            okText: cfg.okText || '确定',
            okText2: cfg.okText2 || '',
            footerClass: cfg.footerClass || '',
            switch: cfg.switch || false,
            closable: cfg.closable || false,
            render: h => h('div', [
                cfg.address ? h('div', {
                    style: {
                        height: '64px',
                        lineHeight: '64px',
                        background: '#ffffff',
                        border: '1px solid #e9eaec',
                        position: 'relative',
                        top: '8px',
                        boxShadow: '0 0 8px 2px #f3f3f3',
                        borderRadius: '12%',
                        textAlign: 'center'
                    }
                }, [
                    h('audio', {
                        attrs: {
                            id: 'ao',
                            preload: 'preload',
                            src: `http://127.0.0.1:8099/wav/GensysRecord/${cfg.address}`
                        },
                        style: {
                            display: 'none'
                        }
                    }),
                    h('ButtonGroup', {
                        props: {
                            size: 'large',
                            shape: 'circle'
                        }
                    }, [
                        h('Button', {
                            class: 'ak-play',
                            props: {
                                type: 'ghost',
                                icon: vm.$store.state.audio.icon
                            },
                            style: {
                                width: '40px'
                            },
                            on: {
                                click: () => {
                                    if (vm.$store.state.audio.icon === 'play') {
                                        vm.$store.state.audio.icon = 'pause'
                                        vm.$store.state.audio.ao.play()
                                        vm.$store.state.audio.time = vm.$store.state.audio.ao.currentTime
                                        vm.$store.state.audio.interval = setInterval(() => {
                                            if (vm.$store.state.audio.ok) {
                                                if (vm.$store.state.audio.ao.currentTime < vm.$store.state.audio.max) {
                                                    vm.$store.state.audio.time = vm.$store.state.audio.ao.currentTime
                                                } else {
                                                    vm.$store.state.audio.icon = 'play'
                                                    vm.$store.state.audio.ao.pause()
                                                    vm.$store.state.audio.ao.currentTime = 0
                                                    vm.$store.state.audio.time = 0
                                                    clearInterval(vm.$store.state.audio.interval)
                                                }
                                            }
                                        }, 1000)
                                    } else {
                                        vm.$store.state.audio.icon = 'play'
                                        vm.$store.state.audio.ao.pause()
                                        clearInterval(vm.$store.state.audio.interval)
                                    }
                                }
                            }
                        }),
                        h('Button', {
                            props: {
                                type: 'ghost'
                            }
                        }, [
                            h('div', {
                                style: {
                                    width: '235px',
                                    textAlign: 'left'
                                }
                            }, [
                                h('span', {
                                    style: {
                                        position: 'relative',
                                        top: '1px',
                                        fontSize: '12px'
                                    }
                                }, this.tipFormat(parseInt(vm.$store.state.audio.time)) + ' / ' + this.tipFormat(vm.$store.state.audio.max))
                            ]),
                            h('Slider', {
                                props: {
                                    value: parseInt(vm.$store.state.audio.time),
                                    tipFormat: this.tipFormat,
                                    max: vm.$store.state.audio.max
                                },
                                style: {
                                    position: 'absolute',
                                    top: '-1px',
                                    width: '132px',
                                    left: '115px'
                                },
                                on: {
                                    'on-change': v => {
                                        if (vm.$store.state.audio.ao) {
                                            vm.$store.state.audio.ok = true
                                            vm.$store.state.audio.ao.currentTime = v
                                            vm.$store.state.audio.time = v
                                        }
                                    },
                                    'on-start': () => {
                                        vm.$store.state.audio.ok = false
                                    },
                                    'on-end': () => {
                                        vm.$store.state.audio.ok = true
                                    }
                                }
                            })
                        ]),
                        h('Button', {
                            class: 'ak-play1',
                            props: {
                                type: 'ghost',
                                icon: vm.$store.state.audio.icon1
                            },
                            style: {
                                width: '40px'
                            },
                            on: {
                                click: () => {
                                    if (vm.$store.state.audio.icon1 === 'android-volume-up') {
                                        vm.$store.state.audio.icon1 = 'android-volume-off'
                                        vm.$store.state.audio.ao.volume = 0
                                    } else {
                                        vm.$store.state.audio.icon1 = 'android-volume-up'
                                        vm.$store.state.audio.ao.volume = 1
                                    }
                                }
                            }
                        })
                    ])
                ]) : '',
                ...(cfg.rows || []).map(item => {
                    return item.constructor === Array ? h('Row', {
                        props: {
                            className: `row-info ${item.constructor === Array ? item[2] : item.className}`
                        }
                    }, [
                        ...this.itemDom(h, cfg, item[0], 0),
                        ...(item[1] ? this.itemDom(h, cfg, item[1], 2) : [])
                    ]) : h('Row', {
                        props: {
                            className: `row-info ${item.constructor === Array ? item[2] : item.className}`
                        },
                        style: {
                            ...(item.show ? {
                                display: this.isShow(item.show, cfg.data) ? 'inherit' : 'none'
                            } : {})
                        }
                    }, this.itemDom(h, cfg, item, 0))
                })
            ]),
            onVerify: (type) => {
                let isVerify = true
                for (let i = 0, ilen = cfg.rows.length; i < ilen; i++) {
                    const row = cfg.rows[i]
                    if (row.constructor === Array) {
                        for (let j = 0, jlen = row.length; j < jlen; j++) {
                            if (row[j].verify) {
                                switch (row[j].verify.length) {
                                    case 1:
                                        if (!cfg.data[row[j].key] || (cfg.data[row[j].key].constructor === Array && cfg.data[row[j].key].length === 0)) {
                                            isVerify = false
                                            cfg.verify[row[j].key] = row[j].verify[0].constructor === Function ? row[j].verify[0](type) : row[j].verify[0]
                                        }
                                        break
                                    case 2:
                                        if (row[j].verify[0].constructor === Function) {
                                            if (row[j].verify[0]()) {
                                                isVerify = false
                                                cfg.verify[row[j].key] = row[j].verify[1].constructor === Function ? row[j].verify[1](type) : row[j].verify[1]
                                            }
                                        } else {
                                            if (!row[j].verify[0].test(cfg.data[row[j].key] || '')) {
                                                isVerify = false
                                                cfg.verify[row[j].key] = row[j].verify[1].constructor === Function ? row[j].verify[1](type) : row[j].verify[1]
                                            }
                                        }
                                        break
                                }
                            }
                        }
                    } else {
                        if (row.show && !this.isShow(row.show, cfg.data)) continue
                        if (row.verify) {
                            switch (row.verify.length) {
                                case 1:
                                    if (!cfg.data[row.key] || (cfg.data[row.key].constructor === Array && cfg.data[row.key].length === 0)) {
                                        isVerify = false
                                        cfg.verify[row.key] = row.verify[0].constructor === Function ? row.verify[0](type) : row.verify[0]
                                    }
                                    break
                                case 2:
                                    if (row.verify[0].constructor === Function) {
                                        if (row.verify[0](type)) {
                                            isVerify = false
                                            cfg.verify[row.key] = row.verify[1].constructor === Function ? row.verify[1](type) : row.verify[1]
                                        }
                                    } else {
                                        if (!row.verify[0].test(cfg.data[row.key] || '')) {
                                            isVerify = false
                                            cfg.verify[row.key] = row.verify[1].constructor === Function ? row.verify[1](type) : row.verify[1]
                                        }
                                    }
                                    break
                            }
                        }
                    }
                }
                return isVerify
            },
            onOk: cancel => {
                if (cfg.address && vm.$store.state.audio.max) {
                    clearInterval(vm.$store.state.audio.interval)
                    vm.$store.state.audio.ao.currentTime = 0
                    vm.$store.state.audio.ao.volume = 1
                    vm.$store.state.audio.ao.pause()
                    vm.$store.state.audio = {
                        icon: 'play',
                        icon1: 'android-volume-up',
                        max: 0,
                        time: 0,
                        ao: null,
                        interval: null,
                        ok: true
                    }
                }
                onOk(cancel)
            },
            onOk2: cancel => {
                if (cfg.address && vm.$store.state.audio.max) {
                    clearInterval(vm.$store.state.audio.interval)
                    vm.$store.state.audio.ao.currentTime = 0
                    vm.$store.state.audio.ao.volume = 1
                    vm.$store.state.audio.ao.pause()
                    vm.$store.state.audio = {
                        icon: 'play',
                        icon1: 'android-volume-up',
                        max: 0,
                        time: 0,
                        ao: null,
                        interval: null,
                        ok: true
                    }
                }
                if (onOk2) onOk2(cancel)
            },
            onCancel: () => {
                if (cfg.address && vm.$store.state.audio.max) {
                    clearInterval(vm.$store.state.audio.interval)
                    vm.$store.state.audio.ao.currentTime = 0
                    vm.$store.state.audio.ao.volume = 1
                    vm.$store.state.audio.ao.pause()
                    vm.$store.state.audio = {
                        icon: 'play',
                        icon1: 'android-volume-up',
                        max: 0,
                        time: 0,
                        ao: null,
                        interval: null,
                        ok: true
                    }
                }
            }
        })
        // 渲染结束执行
        vm.$nextTick(_ => {
            if (cfg.address && !vm.$store.state.audio.max) {
                setTimeout(() => {
                    vm.$store.state.audio.ao = document.getElementById('ao')
                    vm.$store.state.audio.max = vm.$store.state.audio.ao.duration
                }, 1000)
            }
        })
    },
    // 弹出层记录UI生成
    showModalRecord (cfg) {
        this.showM(cfg.title || 'test').info({
            title: cfg.title || '',
            width: cfg.width || '400px',
            okText: '取消',
            render: h => h('div', {
                style: {
                    position: 'relative',
                    top: '14px',
                    height: '385px'
                }
            }, [
                h('div', {
                    style: {
                        position: 'relative',
                        height: '35px',
                        lineHeight: '34px',
                        color: '#fff',
                        fontSize: '16px',
                        background: '#c1c1c1',
                        border: '2px solid #f1f1f1',
                        paddingLeft: '9px'
                    }
                }, cfg.rowTitle),
                h('div', {
                    style: {
                        position: 'relative',
                        height: '350px',
                        overflow: 'auto',
                        paddingTop: '20px',
                        paddingLeft: '12px'
                    }
                }, [
                    h('Timeline', cfg.data.map(r => h('TimelineItem', {
                        style: {
                            paddingBottom: '0'
                        }
                    }, [
                        h('p', {
                            style: {
                                position: 'relative',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                top: '-2px',
                                marginBottom: '10px',
                                display: r[cfg.rowKey] ? '' : 'none'
                            }
                        }, this.formatDate(new Date(r[cfg.rowKey]), 'yyyy-MM-dd hh:mm:ss')),
                        ...cfg.dataKeys.map(dataKey => h('div', {
                            style: {
                                paddingLeft: '5px',
                                height: '18px'
                            }
                        }, [
                            h('div', {
                                style: {
                                    width: '36%',
                                    textAlign: 'right',
                                    float: 'left'
                                }
                            }, `${dataKey.label}:`),
                            h('div', {
                                style: {
                                    width: '62%',
                                    float: 'right'
                                }
                            }, typeof dataKey.key === 'string' ? (r[dataKey.key] || '') : cfg.rowValue(dataKey.key, r))
                        ]))
                    ])))
                ])
            ])
        })
    },
    // 错误信息格式
    eF (title, desc, type) {
        return { title: `${title} - ${type ? '返回错误' : '请求出错'}`, desc, duration: 3, closable: true }
    },
    // 时间转换
    tipFormat (time) {
        let m = 0
        let s = 0
        let _m = '00'
        let _s = '00'
        time = Math.floor(time % 3600)
        m = Math.floor(time / 60)
        s = Math.floor(time % 60)
        _s = s < 10 ? '0' + s : s + ''
        _m = m < 10 ? '0' + m : m + ''
        return _m + ':' + _s
    },
    // 简单请求方法生成
    httpMethod (vm, cfg, callback) {
        if (vm.api.isEnabled) {
            // 分页查询项目列表
            if (cfg.isList) {
                if (cfg.table) {
                    cfg.table.loading = true
                } else {
                    vm.tableCfg.loading = true
                }
            }
            vm.api[cfg.apiName](cfg.data).then(d => {
                if (d.data.IsSuccess) {
                    if (cfg.isList) {
                        if (cfg.table) {
                            cfg.table.loading = false
                        } else {
                            vm.tableCfg.loading = false
                        }
                    }
                    callback(d, () => {
                        if (!cfg.isList && !cfg.isQuery) {
                            vm.$Notice.success({ title: cfg.apiInfo + ' - 成功！' })
                        }
                    })
                } else {
                    if (cfg.isList) {
                        if (cfg.table) {
                            cfg.table.loading = false
                        } else {
                            vm.tableCfg.loading = false
                        }
                    }
                    if (cfg.bs) cfg.bs()
                    if (cfg.cancel) cfg.cancel(true)
                    if (!cfg.noError) vm.$Notice.error(this.eF(cfg.apiInfo, d.data.Info, true))
                }
            }).catch(e => {
                if (cfg.isList) {
                    if (cfg.table) {
                        cfg.table.loading = false
                    } else {
                        vm.tableCfg.loading = false
                    }
                }
                if (cfg.bs) cfg.bs()
                if (cfg.cancel) cfg.cancel(true)
                if (!cfg.noError) vm.$Notice.error(this.eF(cfg.apiInfo, e.message))
            })
        }
    }
}
