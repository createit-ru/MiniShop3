ms3.grid.Default = function (config) {

    config = config || {};

    if (typeof(config['multi_select']) != 'undefined' && config['multi_select'] === true) {
        config.sm = new Ext.grid.CheckboxSelectionModel();
    }

    Ext.applyIf(config, {
        url: ms3.config.connector_url,
        baseParams: {},
        cls: config['cls'] || 'main-wrapper ms3-grid',
        autoHeight: true,
        paging: true,
        remoteSort: true,
        fields: this.getFields(config),
        columns: this.getColumns(config),
        tbar: this.getTopBar(config),
        listeners: this.getListeners(config),
        viewConfig: {
            forceFit: true,
            enableRowBody: true,
            autoFill: true,
            showPreview: true,
            scrollOffset: -10,
            getRowClass: function (rec) {
                const cls = [];
                if (rec.data['published'] !== undefined && (rec.data['published'] === false || parseInt(rec.data['published']) === 0)) {
                    cls.push('ms3-row-unpublished');
                }
                if (rec.data['active'] !== undefined && (rec.data['active'] === false || parseInt(rec.data['active']) === 0)) {
                    cls.push('ms3-row-inactive');
                }
                if (rec.data['deleted'] !== undefined && (rec.data['deleted'] === true || parseInt(rec.data['deleted']) === 1)) {
                    cls.push('ms3-row-deleted');
                }
                if (rec.data['required'] !== undefined && (rec.data['required'] === true || parseInt(rec.data['required']) === 1)) {
                    cls.push('ms3-row-required');
                }
                return cls.join(' ');
            }
        },
    });
    ms3.grid.Default.superclass.constructor.call(this, config);

    if (config.enableDragDrop && config.ddAction) {
        this.on('render', function (grid) {
            grid._initDD(config);
        });
    }
};
Ext.extend(ms3.grid.Default, MODx.grid.Grid, {

    getFields: function () {
        return [
            'id', 'actions'
        ];
    },

    getColumns: function () {
        return [{
            header: _('id'),
            dataIndex: 'id',
            width: 35,
            sortable: true,
        }, {
            header: _('ms3_actions'),
            dataIndex: 'actions',
            renderer: ms3.utils.renderActions,
            sortable: false,
            width: 75,
            id: 'actions'
        }];
    },

    getTopBar: function () {
        return ['->', this.getSearchField()];
    },

    getSearchField: function (width) {
        return {
            xtype: 'ms3-field-search',
            width: width || 250,
            listeners: {
                search: {
                    fn: function (field) {
                        this._doSearch(field);
                    }, scope: this
                },
                clear: {
                    fn: function (field) {
                        field.setValue('');
                        this._clearSearch();
                    }, scope: this
                },
            }
        };
    },

    getListeners: function () {
        return {
            /*
            rowDblClick: function(grid, rowIndex, e) {
            const row = grid.store.getAt(rowIndex);
            this.someAction(grid, e, row);
            }
            */
        };
    },

    getMenu: function (grid, rowIndex) {
        const ids = this._getSelectedIds();
        const row = grid.getStore().getAt(rowIndex);

        const menu = ms3.utils.getMenu(row.data['actions'], this, ids);

        this.addContextMenuItem(menu);
    },

    onClick: function (e) {
        const elem = e.getTarget();
        if (elem.nodeName === 'BUTTON') {
            const row = this.getSelectionModel().getSelected();
            if (typeof(row) != 'undefined') {
                const action = elem.getAttribute('action');
                if (action === 'showMenu') {
                    const ri = this.getStore().find('id', row.id);
                    return this._showMenu(this, ri, e);
                } else if (typeof this[action] === 'function') {
                    this.menu.record = row.data;
                    return this[action](this, e);
                }
            }
        } else if (elem.nodeName === 'A' && elem.href.match(/(\?|\&)a=resource/)) {
            if (e.button == 1 || (e.button == 0 && e.ctrlKey === true)) {
                // Bypass
            } else if (elem.target && elem.target === '_blank') {
                // Bypass
            } else {
                e.preventDefault();
                MODx.loadPage('', elem.href);
            }
        }
        return this.processEvent('click', e);
    },

    refresh: function () {
        this.getStore().reload();
        if (this.config['enableDragDrop'] === true) {
            this.getSelectionModel().clearSelections(true);
        }
    },

    _doSearch: function (tf) {
        this.getStore().baseParams.query = tf.getValue();
        this.getBottomToolbar().changePage(1);
    },

    _clearSearch: function () {
        this.getStore().baseParams.query = '';
        this.getBottomToolbar().changePage(1);
    },

    _getSelectedIds: function () {
        const ids = [];
        const selected = this.getSelectionModel().getSelections();

        for (const i in selected) {
            if (!selected.hasOwnProperty(i)) {
                continue;
            }
            ids.push(selected[i]['id']);
        }

        return ids;
    },

    _initDD: function (config) {
        const grid = this;
        const el = grid.getEl();

        new Ext.dd.DropTarget(el, {
            ddGroup: grid.ddGroup,
            notifyDrop: function (dd, e, data) {
                const store = grid.getStore();
                const target = store.getAt(dd.getDragData(e).rowIndex);
                const sources = [];
                if (data.selections.length < 1 || data.selections[0].id == target.id) {
                    return false;
                }
                for (const i in data.selections) {
                    if (!data.selections.hasOwnProperty(i)) {
                        continue;
                    }
                    const row = data.selections[i];
                    sources.push(row.id);
                }

                el.mask(_('loading'), 'x-mask-loading');
                MODx.Ajax.request({
                    url: config.url,
                    params: {
                        action: config.ddAction,
                        sources: Ext.util.JSON.encode(sources),
                        target: target.id,
                    },
                    listeners: {
                        success: {
                            fn: function () {
                                el.unmask();
                                grid.refresh();
                                if (typeof(grid.reloadTree) == 'function') {
                                    sources.push(target.id);
                                    grid.reloadTree(sources);
                                }
                                if (grid.xtype === 'ms3-grid-products' && !grid.defaultNotify) {
                                    const sourceNodes = data.selections;
                                    if (Ext.isArray(sourceNodes) && sourceNodes.length > 0) {
                                        let message = '';
                                        const singleParent = sourceNodes.every(function (node) {
                                            return node.data.parent == sourceNodes[0].data.parent;
                                        });

                                        if (singleParent) {
                                            if (sourceNodes[0].data.parent != target.data.parent) {
                                                if (target.data.category_name === '') {
                                                    message = (sourceNodes.length > 1) ? _('ms3_drag_move_current_many_success') : _('ms3_drag_move_current_once_success');
                                                } else {
                                                    message = (sourceNodes.length > 1) ? String.format(_('ms3_drag_move_many_success'), target.data.category_name) : String.format(_('ms3_drag_move_one_success'), target.data.category_name);
                                                }
                                            }
                                            // else {
                                            //     message = (sourceNodes.length > 1) ? _('ms3_drag_sort_many_success') : _('ms3_drag_sort_once_success');
                                            // }
                                        } else {
                                            message = (sourceNodes.length > 1) ? String.format(_('ms3_drag_move_many_success'), target.data.category_name) : String.format(_('ms3_drag_move_one_success'), target.data.category_name);
                                        }

                                        if (message !== '') {
                                            MODx.msg.status({
                                                title: _('success')
                                                ,message: message
                                            });
                                        }
                                    }
                                }
                            }, scope: grid
                        },
                        failure: {
                            fn: function () {
                                el.unmask();
                            }, scope: grid
                        },
                    }
                });
            },
            notifyOver: function (dd, e, data) {
                const returnCls = this.dropAllowed;
                if (grid.xtype === 'ms3-grid-products' && !grid.defaultNotify) {
                    if (dd.getDragData(e)) {
                        const sourceNodes = data.selections;
                        const targetNode = dd.getDragData(e).selections[0];

                        if (Ext.isArray(sourceNodes) && sourceNodes.length > 0) {
                            const singleParent = sourceNodes.every(function (node) {
                                return node.data.parent == sourceNodes[0].data.parent;
                            });

                            if (singleParent) {
                                if ((sourceNodes[0].data['id'] == targetNode.data['id'])) {
                                    this._notifySelf(sourceNodes.length, dd);
                                    return this.dropNotAllowed;
                                } else if (sourceNodes[0].data.parent != targetNode.data.parent) {
                                    this._notifyMove(sourceNodes.length, targetNode, dd);
                                } else {
                                    this._notifySort(sourceNodes.length, dd);
                                }
                            } else {
                                this._notifyMove(sourceNodes.length, targetNode, dd);
                            }
                        }

                        dd.proxy.update(dd.ddel);
                    }
                }
                return returnCls;
            },
            _notifyMove: function (count, targetNode, dd) {
                returnCls = 'x-tree-drop-ok-append';
                if (targetNode.data.category_name === '') {
                    dd.ddel.innerHTML = (count > 1) ? _('ms3_drag_move_current_many') : _('ms3_drag_move_current_one');
                } else {
                    dd.ddel.innerHTML = (count > 1) ? String.format(_('ms3_drag_move_many'), targetNode.data.category_name) : String.format(_('ms3_drag_move_one'), targetNode.data.category_name);
                }
            },
            _notifySort: function (count, dd) {
                returnCls = 'x-tree-drop-ok-between';
                dd.ddel.innerHTML = (count > 1) ? _('ms3_drag_sort_many') : _('ms3_drag_sort_one');
            },
            _notifySelf: function (count, dd) {
                dd.ddel.innerHTML = (count > 1) ? _('ms3_drag_self_many') : _('ms3_drag_self_one');
            }
        });
    },

    _loadStore: function () {
        this.store = new Ext.data.JsonStore({
            url: this.config.url,
            baseParams: this.config.baseParams || {action: this.config.action || 'getList'},
            fields: this.config.fields,
            root: 'results',
            totalProperty: 'total',
            remoteSort: this.config.remoteSort || false,
            storeId: this.config.storeId || Ext.id(),
            autoDestroy: true,
            listeners: {
                load: function (store, rows, data) {
                    store.sortInfo = {
                        field: data.params['sort'] || 'id',
                        direction: data.params['dir'] || 'ASC',
                    };
                    Ext.getCmp('modx-content').doLayout();
                }
            }
        });
    },

});
Ext.reg('ms3-grid-default', ms3.grid.Default);
