import Vue from 'vue';
import Modal from './modal.vue';
import Button from '../button/button.vue';
import Locale from '../../mixins/locale';

const prefixCls = 'ivu-modal-confirm';

Modal.newInstance = properties => {
    const _props = properties || {};

    const Instance = new Vue({
        mixins: [ Locale ],
        data: Object.assign({}, _props, {
            visible: false,
            width: 416,
            styles: {},
            title: '',
            switch: false,
            body: '',
            iconType: '',
            iconName: '',
            okText: undefined,
            okText2: undefined,
            cancelText: undefined,
            footerClass: undefined,
            showCancel: false,
            loading: false,
            buttonLoading: false,
            scrollable: false,
            closable: false,
            cancelType: undefined,
            onVerify: undefined
        }),
        render (h) {
            let footerVNodes = [];
            if (this.showCancel) {
                footerVNodes.push(h(Button, {
                    props: {
                        type: this.cancelType ? this.cancelType : 'text'
                    },
                    on: {
                        click: this.cancel
                    }
                }, this.localeCancelText));
            }
            if (this.okText2) {
                footerVNodes.push(h(Button, {
                    attrs: {
                        id: this.okText2,
                    },
                    props: {
                        type: 'error',
                        loading: this.buttonLoading
                    },
                    on: {
                        click: this.ok2
                    }
                }, this.okText2));
            }
            footerVNodes.push(h(Button, {
                attrs: {
                    id: this.localeOkText,
                },
                props: {
                    
                    type: 'primary',
                    loading: this.buttonLoading
                },
                on: {
                    click: this.ok
                }
            }, this.localeOkText));

            // render content
            let body_render;
            if (this.render) {
                body_render = h('div', {
                    attrs: {
                        class: `${prefixCls}-body ${prefixCls}-body-render`
                    }
                }, [this.render(h)]);
            } else {
                body_render = h('div', {
                    attrs: {
                        class: `${prefixCls}-body`
                    }
                }, [
                    h('div', {
                        class: this.iconTypeCls
                    }, [
                        h('i', {
                            class: this.iconNameCls
                        })
                    ]),
                    h('div', {
                        domProps: {
                            innerHTML: this.body
                        }
                    })
                ]);
            }

            return h(Modal, {
                props: Object.assign({}, _props, {
                    width: this.width,
                    scrollable: this.scrollable,
                    closable: this.closable,
                    styles: this.styles
                }),
                domProps: {
                    value: this.visible
                },
                on: {
                    input: (status) => {
                        this.visible = status;
                    }
                }
            }, [
                h('div', {
                    attrs: {
                        class: prefixCls
                    }
                }, [
                    this.title ? h('div', {
                        attrs: {
                            class: `${prefixCls}-head`
                        }
                    }, [
                        h('div', {
                            attrs: {
                                class: `${prefixCls}-head-title`
                            },
                            domProps: {
                                innerHTML: this.title
                            }
                        })
                    ]) : '',
                    body_render,
                    h('div', {
                        attrs: {
                            class: `${prefixCls}-footer ${this.footerClass || ''}`
                        }
                    }, footerVNodes)
                ])
            ]);
        },
        computed: {
            iconTypeCls () {
                return [
                    `${prefixCls}-body-icon`,
                    `${prefixCls}-body-icon-${this.iconType}`
                ];
            },
            iconNameCls () {
                return [
                    'ivu-icon',
                    `ivu-icon-${this.iconName}`
                ];
            },
            localeOkText () {
                if (this.okText) {
                    return this.okText;
                } else {
                    return this.t('i.modal.okText');
                }
            },
            localeCancelText () {
                if (this.cancelText) {
                    return this.cancelText;
                } else {
                    return this.t('i.modal.cancelText');
                }
            }
        },
        methods: {
            cancel () {
                this.$children[0].visible = false;
                this.buttonLoading = false;
                this.onCancel();
                this.remove();
            },
            _cancel (loading) {
                if (loading) {
                    this.buttonLoading = false;
                } else {
                    this.$children[0].visible = false;
                    this.buttonLoading = false;
                    this.remove();
                }
            },
            ok () {
                if (!this.onVerify) {
                    if (this.loading) {
                        this.buttonLoading = true;
                    } else {
                        if (!this.switch) {
                            this.$children[0].visible = false;
                            this.remove();
                        } else {
                            this.buttonLoading = true;
                        }
                    }
                    this.onOk(this.switch ? this._cancel : undefined);
                } else {
                    if (this.onVerify('ok1')) {
                        if (this.loading) {
                            this.buttonLoading = true;
                        } else {
                            if (!this.switch) {
                                this.$children[0].visible = false;
                                this.remove();
                            } else {
                                this.buttonLoading = true;
                            }
                        }
                        this.onOk(this.switch ? this._cancel : undefined);
                    }
                }
            },
            ok2 () {
                if (!this.onVerify) {
                    if (this.loading) {
                        this.buttonLoading = true;
                    } else {
                        if (!this.switch) {
                            this.$children[0].visible = false;
                            this.remove();
                        } else {
                            this.buttonLoading = true;
                        }
                    }
                    this.onOk2(this.switch ? this._cancel : undefined);
                } else {
                    if (this.onVerify('ok2')) {
                        if (this.loading) {
                            this.buttonLoading = true;
                        } else {
                            if (!this.switch) {
                                this.$children[0].visible = false;
                                this.remove();
                            } else {
                                this.buttonLoading = true;
                            }
                        }
                        this.onOk2(this.switch ? this._cancel : undefined);
                    }
                }
            },
            remove () {
                setTimeout(() => {
                    this.destroy();
                }, 300);
            },
            destroy () {
                this.$destroy();
                try {
                    document.body.removeChild(this.$el);
                } catch(e) {
                    console.log(e.message)
                }
                this.onRemove();
            },
            onOk () {
                this._cancel()
            },
            onOk2 () {
                this._cancel()
            },
            onCancel () {
                this._cancel()
            },
            onRemove () {}
        }
    });

    const component = Instance.$mount();
    document.body.appendChild(component.$el);
    const modal = Instance.$children[0];

    return {
        show (props) {
            modal.$parent.showCancel = props.showCancel;
            modal.$parent.iconType = props.icon;

            switch (props.icon) {
                case 'info':
                    modal.$parent.iconName = 'information-circled';
                    break;
                case 'success':
                    modal.$parent.iconName = 'checkmark-circled';
                    break;
                case 'warning':
                    modal.$parent.iconName = 'android-alert';
                    break;
                case 'error':
                    modal.$parent.iconName = 'close-circled';
                    break;
                case 'confirm':
                    modal.$parent.iconName = 'help-circled';
                    break;
            }

            if ('width' in props) {
                modal.$parent.width = props.width;
            }

            if ('styles' in props) {
                modal.$parent.styles = props.styles;
            }

            if ('closable' in props) {
                modal.$parent.closable = props.closable;
            }

            if ('title' in props) {
                modal.$parent.title = props.title;
            }

            if ('switch' in props) {
                modal.$parent.switch = props.switch;
            }

            if ('content' in props) {
                modal.$parent.body = props.content;
            }

            if ('okText' in props) {
                modal.$parent.okText = props.okText;
            }

            if ('okText2' in props) {
                modal.$parent.okText2 = props.okText2;
            }

            if ('cancelText' in props) {
                modal.$parent.cancelText = props.cancelText;
            }

            if ('footerClass' in props) {
                modal.$parent.footerClass = props.footerClass;
            }

            if ('cancelType' in props) {
                modal.$parent.cancelType = props.cancelType;
            }

            if ('onCancel' in props) {
                modal.$parent.onCancel = props.onCancel;
            }

            if ('onOk' in props) {
                modal.$parent.onOk = props.onOk;
            }

            if ('onOk2' in props) {
                modal.$parent.onOk2 = props.onOk2;
            }

            if ('onVerify' in props) {
                modal.$parent.onVerify = props.onVerify;
            }

            // async for ok
            if ('loading' in props) {
                modal.$parent.loading = props.loading;
            }

            if ('scrollable' in props) {
                modal.$parent.scrollable = props.scrollable;
            }

            // notice when component destroy
            modal.$parent.onRemove = props.onRemove;

            modal.visible = true;
        },
        remove () {
            modal.visible = false;
            modal.$parent.buttonLoading = false;
            modal.$parent.remove();
        },
        component: modal
    };
};

export default Modal;