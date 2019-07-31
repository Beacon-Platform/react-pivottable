'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Utilities = require('./Utilities');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!

function redColorScaleGenerator(values) {
  var min = Math.min.apply(Math, values);
  var max = Math.max.apply(Math, values);
  return function (x) {
    // eslint-disable-next-line no-magic-numbers
    var nonRed = 255 - Math.round(255 * (x - min) / (max - min));
    return { backgroundColor: 'rgb(255,' + nonRed + ',' + nonRed + ')' };
  };
}

function makeRenderer() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var TableRenderer = function (_React$Component) {
    _inherits(TableRenderer, _React$Component);

    function TableRenderer(props) {
      _classCallCheck(this, TableRenderer);

      // We need state to record which entries are collapsed and which aren't.
      // This is an object with flat-keys indicating if the corresponding rows
      // should be collapsed.
      var _this = _possibleConstructorReturn(this, (TableRenderer.__proto__ || Object.getPrototypeOf(TableRenderer)).call(this, props));

      _this.state = { collapsedRows: {}, collapsedCols: {} };
      return _this;
    }

    _createClass(TableRenderer, [{
      key: 'getBasePivotSettings',
      value: function getBasePivotSettings() {
        // One-time extraction of pivot settings that we'll use throughout the render.

        var props = this.props;
        var colAttrs = props.cols;
        var rowAttrs = props.rows;

        var tableOptions = Object.assign({
          rowTotals: true,
          colTotals: true
        }, props.tableOptions);
        var rowTotals = tableOptions.rowTotals || colAttrs.length === 0;
        var colTotals = tableOptions.colTotals || rowAttrs.length === 0;

        var subtotalOptions = Object.assign({
          arrowCollapsed: '\u25B6',
          arrowExpanded: '\u25E2'
        }, props.subtotalOptions);

        var colSubtotalDisplay = Object.assign({
          displayOnTop: false,
          enabled: rowTotals,
          hideOnExpand: false
        }, subtotalOptions.colSubtotalDisplay);

        var rowSubtotalDisplay = Object.assign({
          displayOnTop: true,
          enabled: colTotals,
          hideOnExpand: false
        }, subtotalOptions.rowSubtotalDisplay);

        var pivotData = new _Utilities.PivotData(props, !opts.subtotals ? {} : {
          rowEnabled: rowSubtotalDisplay.enabled,
          colEnabled: colSubtotalDisplay.enabled,
          rowPartialOnTop: rowSubtotalDisplay.displayOnTop,
          colPartialOnTop: colSubtotalDisplay.displayOnTop
        });
        var rowKeys = pivotData.getRowKeys();
        var colKeys = pivotData.getColKeys();

        // Also pre-calculate all the callbacks for cells, etc... This is nice to have to
        // avoid re-calculations of the call-backs on cell expansions, etc...
        var cellCallbacks = {};
        var rowTotalCallbacks = {};
        var colTotalCallbacks = {};
        var grandTotalCallback = null;
        if (tableOptions.clickCallback) {
          for (var rowKey in rowKeys) {
            var flatRowKey = (0, _Utilities.flatKey)(rowKey);
            if (!(flatRowKey in cellCallbacks)) {
              cellCallbacks[flatRowKey] = {};
            }
            for (var colKey in colKeys) {
              cellCallbacks[flatRowKey][(0, _Utilities.flatKey)(colKey)] = this.clickHandler(pivotData, rowKey, colKey);
            }
          }

          // Add in totals as well.
          if (rowTotals) {
            for (var _rowKey in rowKeys) {
              rowTotalCallbacks[(0, _Utilities.flatKey)(_rowKey)] = TableRenderer.clickHandler(pivotData, _rowKey, []);
            }
          }
          if (colTotals) {
            for (var _colKey in colKeys) {
              colTotalCallbacks[(0, _Utilities.flatKey)(_colKey)] = TableRenderer.clickHandler(pivotData, [], _colKey);
            }
          }
          if (rowTotals && colTotals) {
            grandTotalCallback = TableRenderer.clickHandler(pivotData, [], []);
          }
        }

        return Object.assign({
          pivotData: pivotData,
          colAttrs: colAttrs,
          rowAttrs: rowAttrs,
          colKeys: colKeys,
          rowKeys: rowKeys,
          rowTotals: rowTotals,
          colTotals: colTotals,
          arrowCollapsed: subtotalOptions.arrowCollapsed,
          arrowExpanded: subtotalOptions.arrowExpanded,
          colSubtotalDisplay: colSubtotalDisplay,
          rowSubtotalDisplay: rowSubtotalDisplay,
          cellCallbacks: cellCallbacks,
          rowTotalCallbacks: rowTotalCallbacks,
          colTotalCallbacks: colTotalCallbacks,
          grandTotalCallback: grandTotalCallback
        }, TableRenderer.heatmapMappers(pivotData, props.tableColorScaleGenerator, colTotals, rowTotals));
      }
    }, {
      key: 'clickHandler',
      value: function clickHandler(pivotData, rowValues, colValues) {
        var _this2 = this;

        var colAttrs = this.props.cols;
        var rowAttrs = this.props.rows;
        var value = pivotData.getAggregator(rowValues, colValues).value();
        var filters = {};
        var colLimit = Math.min(colAttrs.length, colValues.length);
        for (var i = 0; i < colLimit; i++) {
          var attr = colAttrs[i];
          if (colValues[i] !== null) {
            filters[attr] = colValues[i];
          }
        }
        var rowLimit = Math.min(rowAttrs.length, rowValues.length);
        for (var _i = 0; _i < rowLimit; _i++) {
          var _attr = rowAttrs[_i];
          if (rowValues[_i] !== null) {
            filters[_attr] = rowValues[_i];
          }
        }
        return function (e) {
          return _this2.props.tableOptions.clickCallback(e, value, filters, pivotData);
        };
      }
    }, {
      key: 'collapseAttr',
      value: function collapseAttr(rowOrCol, attrIdx, allKeys) {
        var _this3 = this;

        return function () {
          // Collapse an entire attribute.

          var keyLen = attrIdx + 1;
          var collapsed = allKeys.filter(function (k) {
            return k.length === keyLen;
          }).map(_Utilities.flatKey);

          var updates = {};
          collapsed.forEach(function (k) {
            updates[k] = true;
          });

          if (rowOrCol) {
            _this3.setState(function (state) {
              return {
                collapsedRows: Object.assign({}, state.collapsedRows, updates)
              };
            });
          } else {
            _this3.setState(function (state) {
              return {
                collapsedCols: Object.assign({}, state.collapsedCols, updates)
              };
            });
          }
        };
      }
    }, {
      key: 'expandAttr',
      value: function expandAttr(rowOrCol, attrIdx, allKeys) {
        var _this4 = this;

        return function () {
          // Expand an entire attribute. This implicitly implies expanding all of the
          // parents as well. It's a bit inefficient but ah well...

          var updates = {};
          allKeys.forEach(function (k) {
            for (var i = 0; i <= attrIdx; i++) {
              updates[(0, _Utilities.flatKey)(k.slice(0, i + 1))] = false;
            }
          });

          if (rowOrCol) {
            _this4.setState(function (state) {
              return {
                collapsedRows: Object.assign({}, state.collapsedRows, updates)
              };
            });
          } else {
            _this4.setState(function (state) {
              return {
                collapsedCols: Object.assign({}, state.collapsedCols, updates)
              };
            });
          }
        };
      }
    }, {
      key: 'toggleRowKey',
      value: function toggleRowKey(flatRowKey) {
        var _this5 = this;

        return function () {
          _this5.setState(function (state) {
            return {
              collapsedRows: Object.assign({}, state.collapsedRows, _defineProperty({}, flatRowKey, !state.collapsedRows[flatRowKey]))
            };
          });
        };
      }
    }, {
      key: 'toggleColKey',
      value: function toggleColKey(flatColKey) {
        var _this6 = this;

        return function () {
          _this6.setState(function (state) {
            return {
              collapsedCols: Object.assign({}, state.collapsedCols, _defineProperty({}, flatColKey, !state.collapsedCols[flatColKey]))
            };
          });
        };
      }
    }, {
      key: 'calcAttrSpans',
      value: function calcAttrSpans(attrArr, numAttrs) {
        // Given an array of attribute values (i.e. each element is another array with
        // the value at every level), compute the spans for every attribute value at
        // every level. The return value is a nested array of the same shape. It has
        // -1's for repeated values and the span number otherwise.

        var spans = [];
        // Index of the last new value
        var li = Array(numAttrs).map(function () {
          return 0;
        });
        var lv = Array(numAttrs).map(function () {
          return null;
        });
        for (var i = 0; i < attrArr.length; i++) {
          // Keep increasing span values as long as the last keys are the same. For
          // the rest, record spans of 1. Update the indices too.
          var cv = attrArr[i];
          var ent = [];
          var depth = 0;
          var limit = Math.min(lv.length, cv.length);
          while (depth < limit && lv[depth] === cv[depth]) {
            ent.push(-1);
            spans[li[depth]][depth]++;
            depth++;
          }
          while (depth < cv.length) {
            li[depth] = i;
            ent.push(1);
            depth++;
          }
          spans.push(ent);
          lv = cv;
        }
        return spans;
      }
    }, {
      key: 'renderColHeaderRow',
      value: function renderColHeaderRow(attrName, attrIdx, pivotSettings) {
        // Render a single row in the column header at the top of the pivot table.

        var rowAttrs = pivotSettings.rowAttrs,
            colAttrs = pivotSettings.colAttrs,
            colKeys = pivotSettings.colKeys,
            visibleColKeys = pivotSettings.visibleColKeys,
            colAttrSpans = pivotSettings.colAttrSpans,
            rowTotals = pivotSettings.rowTotals,
            arrowExpanded = pivotSettings.arrowExpanded,
            arrowCollapsed = pivotSettings.arrowCollapsed,
            colSubtotalDisplay = pivotSettings.colSubtotalDisplay,
            maxColVisible = pivotSettings.maxColVisible;


        var spaceCell = attrIdx === 0 && rowAttrs.length !== 0 ? _react2.default.createElement('th', {
          key: 'padding',
          colSpan: rowAttrs.length,
          rowSpan: colAttrs.length
        }) : null;

        var needToggle = opts.subtotals && colSubtotalDisplay.enabled && attrIdx !== colAttrs.length - 1;
        var clickHandle = null;
        var subArrow = null;
        if (needToggle) {
          clickHandle = attrIdx + 1 < maxColVisible ? this.collapseAttr(false, attrIdx, colKeys) : this.expandAttr(false, attrIdx, colKeys);
          subArrow = (attrIdx + 1 < maxColVisible ? arrowExpanded : arrowCollapsed) + ' ';
        }
        var attrNameCell = _react2.default.createElement(
          'th',
          { key: 'label', className: 'pvtAxisLabel', onClick: clickHandle },
          subArrow,
          attrName
        );

        var attrValueCells = [];
        var rowIncrSpan = rowAttrs.length !== 0 ? 1 : 0;
        // Iterate through columns. Jump over duplicate values.
        var i = 0;
        while (i < visibleColKeys.length) {
          var colKey = visibleColKeys[i];
          var colSpan = attrIdx < colKey.length ? colAttrSpans[i][attrIdx] : 1;
          if (attrIdx < colKey.length) {
            var rowSpan = 1 + (attrIdx === colAttrs.length - 1 ? rowIncrSpan : 0);
            var flatColKey = (0, _Utilities.flatKey)(colKey.slice(0, attrIdx + 1));
            var onClick = needToggle ? this.toggleColKey(flatColKey) : null;
            attrValueCells.push(_react2.default.createElement(
              'th',
              {
                className: 'pvtColLabel',
                key: 'colKey-' + flatColKey,
                colSpan: colSpan,
                rowSpan: rowSpan,
                onClick: onClick
              },
              needToggle ? (this.state.collapsedCols[flatColKey] ? arrowCollapsed : arrowExpanded) + ' ' : null,
              colKey[attrIdx]
            ));
          } else if (attrIdx === colKey.length) {
            var _rowSpan = colAttrs.length - colKey.length + rowIncrSpan;
            attrValueCells.push(_react2.default.createElement('th', {
              className: 'pvtColLabel',
              key: 'colKeyBuffer-' + (0, _Utilities.flatKey)(colKey),
              colSpan: colSpan,
              rowSpan: _rowSpan
            }));
          }
          // The next colSpan columns will have the same value anyway...
          i = i + colSpan;
        }

        var totalCell = attrIdx === 0 && rowTotals ? _react2.default.createElement(
          'th',
          {
            key: 'total',
            className: 'pvtTotalLabel',
            rowSpan: colAttrs.length + Math.min(rowAttrs.length, 1)
          },
          'Totals'
        ) : null;

        var cells = [spaceCell, attrNameCell].concat(attrValueCells, [totalCell]);
        return _react2.default.createElement(
          'tr',
          { key: 'colAttr-' + attrIdx },
          cells
        );
      }
    }, {
      key: 'renderRowHeaderRow',
      value: function renderRowHeaderRow(pivotSettings) {
        var _this7 = this;

        // Render just the attribute names of the rows (the actual attribute values
        // will show up in the individual rows).

        var rowAttrs = pivotSettings.rowAttrs,
            colAttrs = pivotSettings.colAttrs,
            rowKeys = pivotSettings.rowKeys,
            arrowCollapsed = pivotSettings.arrowCollapsed,
            arrowExpanded = pivotSettings.arrowExpanded,
            rowSubtotalDisplay = pivotSettings.rowSubtotalDisplay,
            maxRowVisible = pivotSettings.maxRowVisible;

        return _react2.default.createElement(
          'tr',
          { key: 'rowHdr' },
          rowAttrs.map(function (r, i) {
            var needLabelToggle = opts.subtotals && rowSubtotalDisplay.enabled && i !== rowAttrs.length - 1;
            var clickHandle = null;
            var subArrow = null;
            if (needLabelToggle) {
              clickHandle = i + 1 < maxRowVisible ? _this7.collapseAttr(true, i, rowKeys) : _this7.expandAttr(true, i, rowKeys);
              subArrow = (i + 1 < maxRowVisible ? arrowExpanded : arrowCollapsed) + ' ';
            }
            return _react2.default.createElement(
              'th',
              {
                className: 'pvtAxisLabel',
                key: 'rowAttr-' + i,
                onClick: clickHandle
              },
              subArrow,
              r
            );
          }),
          _react2.default.createElement(
            'th',
            { className: 'pvtTotalLabel', key: 'padding' },
            colAttrs.length === 0 ? 'Totals' : null
          )
        );
      }
    }, {
      key: 'renderTableRow',
      value: function renderTableRow(rowKey, rowIdx, pivotSettings) {
        var _this8 = this;

        // Render a single row in the pivot table.

        var rowAttrs = pivotSettings.rowAttrs,
            colAttrs = pivotSettings.colAttrs,
            rowAttrSpans = pivotSettings.rowAttrSpans,
            visibleColKeys = pivotSettings.visibleColKeys,
            pivotData = pivotSettings.pivotData,
            rowTotals = pivotSettings.rowTotals,
            valueCellColors = pivotSettings.valueCellColors,
            rowTotalColors = pivotSettings.rowTotalColors,
            arrowExpanded = pivotSettings.arrowExpanded,
            arrowCollapsed = pivotSettings.arrowCollapsed,
            cellCallbacks = pivotSettings.cellCallbacks,
            rowTotalCallbacks = pivotSettings.rowTotalCallbacks;


        var flatRowKey = (0, _Utilities.flatKey)(rowKey);

        var colIncrSpan = colAttrs.length !== 0 ? 1 : 0;
        var attrValueCells = rowKey.map(function (r, i) {
          var rowSpan = rowAttrSpans[rowIdx][i];
          if (rowSpan > 0) {
            var _flatRowKey = (0, _Utilities.flatKey)(rowKey.slice(0, i + 1));
            var colSpan = 1 + (i === rowAttrs.length - 1 ? colIncrSpan : 0);
            var needRowToggle = opts.subtotals && i !== rowAttrs.length - 1;
            var onClick = needRowToggle ? _this8.toggleRowKey(_flatRowKey) : null;
            return _react2.default.createElement(
              'th',
              {
                key: 'rowKeyLabel-' + i,
                className: 'pvtRowLabel',
                rowSpan: rowSpan,
                colSpan: colSpan,
                onClick: onClick
              },
              needRowToggle ? (_this8.state.collapsedRows[_flatRowKey] ? arrowCollapsed : arrowExpanded) + ' ' : null,
              r
            );
          }
          return null;
        });

        var attrValuePaddingCell = rowKey.length < rowAttrs.length ? _react2.default.createElement('th', {
          className: 'pvtRowLabel',
          key: 'rowKeyBuffer',
          colSpan: rowAttrs.length - rowKey.length + colIncrSpan,
          rowSpan: 1
        }) : null;

        var rowClickHandlers = cellCallbacks[flatRowKey] || {};
        var valueCells = visibleColKeys.map(function (colKey) {
          var flatColKey = (0, _Utilities.flatKey)(colKey);
          var agg = pivotData.getAggregator(rowKey, colKey);
          var aggValue = agg.value();
          var style = valueCellColors(rowKey, colKey, aggValue);
          return _react2.default.createElement(
            'td',
            {
              className: 'pvtVal',
              key: 'pvtVal-' + flatColKey,
              onClick: rowClickHandlers[flatColKey],
              style: style
            },
            agg.format(aggValue)
          );
        });

        var totalCell = null;
        if (rowTotals) {
          var agg = pivotData.getAggregator(rowKey, []);
          var aggValue = agg.value();
          var style = rowTotalColors(aggValue);
          totalCell = _react2.default.createElement(
            'td',
            {
              key: 'total',
              className: 'pvtTotal',
              onClick: rowTotalCallbacks[flatRowKey],
              style: style
            },
            agg.format(aggValue)
          );
        }

        var rowCells = [].concat(_toConsumableArray(attrValueCells), [attrValuePaddingCell], _toConsumableArray(valueCells), [totalCell]);

        return _react2.default.createElement(
          'tr',
          { key: 'keyRow-' + flatRowKey },
          rowCells
        );
      }
    }, {
      key: 'renderTotalsRow',
      value: function renderTotalsRow(pivotSettings) {
        // Render the final totals rows that has the totals for all the columns.

        var rowAttrs = pivotSettings.rowAttrs,
            colAttrs = pivotSettings.colAttrs,
            visibleColKeys = pivotSettings.visibleColKeys,
            colTotalColors = pivotSettings.colTotalColors,
            rowTotals = pivotSettings.rowTotals,
            pivotData = pivotSettings.pivotData,
            colTotalCallbacks = pivotSettings.colTotalCallbacks,
            grandTotalCallback = pivotSettings.grandTotalCallback;


        var totalLabelCell = _react2.default.createElement(
          'th',
          {
            key: 'label',
            className: 'pvtTotalLabel',
            colSpan: rowAttrs.length + Math.min(colAttrs.length, 1)
          },
          'Totals'
        );

        var totalValueCells = visibleColKeys.map(function (colKey) {
          var flatColKey = (0, _Utilities.flatKey)(colKey);
          var agg = pivotData.getAggregator([], colKey);
          var aggValue = agg.value();
          var style = colTotalColors([], colKey, aggValue);
          return _react2.default.createElement(
            'td',
            {
              className: 'pvtTotal',
              key: 'total-' + flatColKey,
              onClick: colTotalCallbacks[flatColKey],
              style: style
            },
            agg.format(aggValue)
          );
        });

        var grandTotalCell = null;
        if (rowTotals) {
          var agg = pivotData.getAggregator([], []);
          var aggValue = agg.value();
          grandTotalCell = _react2.default.createElement(
            'td',
            {
              key: 'total',
              className: 'pvtGrandTotal',
              onClick: grandTotalCallback
            },
            agg.format(aggValue)
          );
        }

        var totalCells = [totalLabelCell].concat(_toConsumableArray(totalValueCells), [grandTotalCell]);

        return _react2.default.createElement(
          'tr',
          { key: 'total' },
          totalCells
        );
      }
    }, {
      key: 'visibleKeys',
      value: function visibleKeys(keys, collapsed, numAttrs, subtotalDisplay) {
        return keys.filter(function (key) {
          return (
            // Is the key hidden by one of its parents?
            !key.some(function (k, j) {
              return collapsed[(0, _Utilities.flatKey)(key.slice(0, j))];
            }) && (
            // Leaf key.
            key.length === numAttrs ||
            // Children hidden. Must show total.
            (0, _Utilities.flatKey)(key) in collapsed ||
            // Don't hide totals.
            !subtotalDisplay.hideOnExpand)
          );
        });
      }
    }, {
      key: 'render',
      value: function render() {
        var _this9 = this;

        if (this.cachedProps !== this.props) {
          this.cachedProps = this.props;
          this.cachedBasePivotSettings = this.getBasePivotSettings();
        }
        var _cachedBasePivotSetti = this.cachedBasePivotSettings,
            colAttrs = _cachedBasePivotSetti.colAttrs,
            rowAttrs = _cachedBasePivotSetti.rowAttrs,
            rowKeys = _cachedBasePivotSetti.rowKeys,
            colKeys = _cachedBasePivotSetti.colKeys,
            colTotals = _cachedBasePivotSetti.colTotals,
            rowSubtotalDisplay = _cachedBasePivotSetti.rowSubtotalDisplay,
            colSubtotalDisplay = _cachedBasePivotSetti.colSubtotalDisplay;

        // Need to account for exclusions to compute the effective row
        // and column keys.

        var visibleRowKeys = opts.subtotals ? this.visibleKeys(rowKeys, this.state.collapsedRows, rowAttrs.length, rowSubtotalDisplay) : rowKeys;
        var visibleColKeys = opts.subtotals ? this.visibleKeys(colKeys, this.state.collapsedCols, colAttrs.length, colSubtotalDisplay) : colKeys;
        var pivotSettings = Object.assign({
          visibleRowKeys: visibleRowKeys,
          maxRowVisible: Math.max.apply(Math, _toConsumableArray(visibleRowKeys.map(function (k) {
            return k.length;
          }))),
          visibleColKeys: visibleColKeys,
          maxColVisible: Math.max.apply(Math, _toConsumableArray(visibleColKeys.map(function (k) {
            return k.length;
          }))),
          rowAttrSpans: this.calcAttrSpans(visibleRowKeys, rowAttrs.length),
          colAttrSpans: this.calcAttrSpans(visibleColKeys, colAttrs.length)
        }, this.cachedBasePivotSettings);

        return _react2.default.createElement(
          'table',
          { className: 'pvtTable' },
          _react2.default.createElement(
            'thead',
            null,
            colAttrs.map(function (c, j) {
              return _this9.renderColHeaderRow(c, j, pivotSettings);
            }),
            rowAttrs.length !== 0 && this.renderRowHeaderRow(pivotSettings)
          ),
          _react2.default.createElement(
            'tbody',
            null,
            visibleRowKeys.map(function (r, i) {
              return _this9.renderTableRow(r, i, pivotSettings);
            }),
            colTotals && this.renderTotalsRow(pivotSettings)
          )
        );
      }
    }], [{
      key: 'heatmapMappers',
      value: function heatmapMappers(pivotData, colorScaleGenerator, colTotals, rowTotals) {
        var valueCellColors = function valueCellColors() {};
        var rowTotalColors = function rowTotalColors() {};
        var colTotalColors = function colTotalColors() {};
        if (opts.heatmapMode) {
          if (colTotals) {
            var colTotalValues = Object.values(pivotData.colTotals).map(function (a) {
              return a.value();
            });
            colTotalColors = colorScaleGenerator(colTotalValues);
          }
          if (rowTotals) {
            var rowTotalValues = Object.values(pivotData.rowTotals).map(function (a) {
              return a.value();
            });
            rowTotalColors = colorScaleGenerator(rowTotalValues);
          }
          if (opts.heatmapMode === 'full') {
            var allValues = [];
            Object.values(pivotData.tree).map(function (cd) {
              return Object.values(cd).map(function (a) {
                return allValues.push(a.value());
              });
            });
            var colorScale = colorScaleGenerator(allValues);
            valueCellColors = function valueCellColors(r, c, v) {
              return colorScale(v);
            };
          } else if (opts.heatmapMode === 'row') {
            var rowColorScales = {};
            Object.entries(pivotData.tree).map(function (_ref) {
              var _ref2 = _slicedToArray(_ref, 2),
                  rk = _ref2[0],
                  cd = _ref2[1];

              var rowValues = Object.values(cd).map(function (a) {
                return a.value();
              });
              rowColorScales[rk] = colorScaleGenerator(rowValues);
            });
            valueCellColors = function valueCellColors(r, c, v) {
              return rowColorScales[(0, _Utilities.flatKey)(r)](v);
            };
          } else if (opts.heatmapMode === 'col') {
            var colColorScales = {};
            var colValues = {};
            Object.values(pivotData.tree).map(function (cd) {
              return Object.entries(cd).map(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    ck = _ref4[0],
                    a = _ref4[1];

                if (!(ck in colValues)) {
                  colValues[ck] = [];
                }
                colValues[ck].push(a.value());
              });
            });
            for (var k in colValues) {
              colColorScales[k] = colorScaleGenerator(colValues[k]);
            }
            valueCellColors = function valueCellColors(r, c, v) {
              return colColorScales[(0, _Utilities.flatKey)(c)](v);
            };
          }
        }
        return { valueCellColors: valueCellColors, rowTotalColors: rowTotalColors, colTotalColors: colTotalColors };
      }
    }]);

    return TableRenderer;
  }(_react2.default.Component);

  TableRenderer.defaultProps = _Utilities.PivotData.defaultProps;
  TableRenderer.propTypes = _Utilities.PivotData.propTypes;
  TableRenderer.defaultProps.tableColorScaleGenerator = redColorScaleGenerator;
  TableRenderer.defaultProps.tableOptions = {};
  TableRenderer.propTypes.tableColorScaleGenerator = _propTypes2.default.func;
  TableRenderer.propTypes.tableOptions = _propTypes2.default.object;
  return TableRenderer;
}

var TSVExportRenderer = function (_React$PureComponent) {
  _inherits(TSVExportRenderer, _React$PureComponent);

  function TSVExportRenderer() {
    _classCallCheck(this, TSVExportRenderer);

    return _possibleConstructorReturn(this, (TSVExportRenderer.__proto__ || Object.getPrototypeOf(TSVExportRenderer)).apply(this, arguments));
  }

  _createClass(TSVExportRenderer, [{
    key: 'render',
    value: function render() {
      var pivotData = new _Utilities.PivotData(this.props);
      var rowKeys = pivotData.getRowKeys();
      var colKeys = pivotData.getColKeys();
      if (rowKeys.length === 0) {
        rowKeys.push([]);
      }
      if (colKeys.length === 0) {
        colKeys.push([]);
      }

      var headerRow = pivotData.props.rows.map(function (r) {
        return r;
      });
      if (colKeys.length === 1 && colKeys[0].length === 0) {
        headerRow.push(this.props.aggregatorName);
      } else {
        colKeys.map(function (c) {
          return headerRow.push(c.join('-'));
        });
      }

      var result = rowKeys.map(function (r) {
        var row = r.map(function (x) {
          return x;
        });
        colKeys.map(function (c) {
          var v = pivotData.getAggregator(r, c).value();
          row.push(v ? v : '');
        });
        return row;
      });

      result.unshift(headerRow);

      return _react2.default.createElement('textarea', {
        value: result.map(function (r) {
          return r.join('\t');
        }).join('\n'),
        style: { width: window.innerWidth / 2, height: window.innerHeight / 2 },
        readOnly: true
      });
    }
  }]);

  return TSVExportRenderer;
}(_react2.default.PureComponent);

TSVExportRenderer.defaultProps = _Utilities.PivotData.defaultProps;
TSVExportRenderer.propTypes = _Utilities.PivotData.propTypes;

exports.default = {
  Table: makeRenderer(),
  'Table Heatmap': makeRenderer({ heatmapMode: 'full' }),
  'Table Col Heatmap': makeRenderer({ heatmapMode: 'col' }),
  'Table Row Heatmap': makeRenderer({ heatmapMode: 'row' }),
  'Table With Subtotal': makeRenderer({ subtotals: true }),
  'Table With Subtotal Heatmap': makeRenderer({
    heatmapMode: 'full',
    subtotals: true
  }),
  'Table With Subtotal Col Heatmap': makeRenderer({
    heatmapMode: 'col',
    subtotals: true
  }),
  'Table With Subtotal Row Heatmap': makeRenderer({
    heatmapMode: 'row',
    subtotals: true
  }),
  'Exportable TSV': TSVExportRenderer
};
module.exports = exports['default'];
//# sourceMappingURL=TableRenderers.js.map