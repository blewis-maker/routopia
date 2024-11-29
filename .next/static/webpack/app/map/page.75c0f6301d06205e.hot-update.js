"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/map/page",{

/***/ "(app-pages-browser)/./src/components/Map.tsx":
/*!********************************!*\
  !*** ./src/components/Map.tsx ***!
  \********************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ Map; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mapbox-gl */ \"(app-pages-browser)/./node_modules/mapbox-gl/dist/mapbox-gl.js\");\n/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(mapbox_gl__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var mapbox_gl_dist_mapbox_gl_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! mapbox-gl/dist/mapbox-gl.css */ \"(app-pages-browser)/./node_modules/mapbox-gl/dist/mapbox-gl.css\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\n\n// Debug token loading\nconsole.log(\"Mapbox token available:\", !!\"pk.eyJ1Ijoicm91dG9waWEtYWkiLCJhIjoiY200MWkzb25xMHFtcjJxcHRmOTE3NTlrNSJ9.d2Ds8SJXnQzc2W1o50D76Q\");\n(mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().accessToken) = \"pk.eyJ1Ijoicm91dG9waWEtYWkiLCJhIjoiY200MWkzb25xMHFtcjJxcHRmOTE3NTlrNSJ9.d2Ds8SJXnQzc2W1o50D76Q\" || 0;\nfunction Map() {\n    _s();\n    const mapContainer = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    const mapInstance = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    const [mapError, setMapError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    // Initialize map with more detailed error handling\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        console.log(\"Initializing map...\");\n        console.log(\"Container exists:\", !!mapContainer.current);\n        console.log(\"Map instance exists:\", !!mapInstance.current);\n        if (mapContainer.current && !mapInstance.current) {\n            try {\n                mapInstance.current = new (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().Map)({\n                    container: mapContainer.current,\n                    style: \"mapbox://styles/mapbox/dark-v11\",\n                    center: [\n                        -105.0178,\n                        39.7392\n                    ],\n                    zoom: 14,\n                    pitch: 45,\n                    bearing: 0\n                });\n                mapInstance.current.on(\"load\", ()=>{\n                    console.log(\"Map loaded successfully\");\n                });\n                mapInstance.current.on(\"error\", (e)=>{\n                    var _e_error;\n                    console.error(\"Mapbox error:\", e);\n                    setMapError(((_e_error = e.error) === null || _e_error === void 0 ? void 0 : _e_error.message) || \"Unknown map error\");\n                });\n            } catch (error) {\n                console.error(\"Map initialization error:\", error);\n                setMapError(error instanceof Error ? error.message : \"Unknown error\");\n            }\n        }\n        return ()=>{\n            var _mapInstance_current;\n            console.log(\"Cleaning up map...\");\n            (_mapInstance_current = mapInstance.current) === null || _mapInstance_current === void 0 ? void 0 : _mapInstance_current.remove();\n        };\n    }, []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"relative w-full h-full\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                ref: mapContainer,\n                className: \"absolute inset-0\",\n                style: {\n                    background: \"#242424\"\n                }\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                lineNumber: 57,\n                columnNumber: 7\n            }, this),\n            mapError && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"absolute top-4 left-4 bg-red-500 text-white p-4 rounded-md\",\n                children: [\n                    \"Error: \",\n                    mapError\n                ]\n            }, void 0, true, {\n                fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                lineNumber: 64,\n                columnNumber: 9\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"absolute top-4 left-4\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                    onClick: ()=>console.log(\"Current map instance:\", mapInstance.current),\n                    className: \"px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-md shadow-lg\",\n                    children: \"Plan Route\"\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                    lineNumber: 70,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                lineNumber: 69,\n                columnNumber: 7\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n        lineNumber: 56,\n        columnNumber: 5\n    }, this);\n}\n_s(Map, \"DulFvH+kBfQYr0bjYsJRSmI/RFo=\");\n_c = Map;\nvar _c;\n$RefreshReg$(_c, \"Map\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9jb21wb25lbnRzL01hcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBRW9EO0FBQ25CO0FBQ0s7QUFFdEMsc0JBQXNCO0FBQ3RCSSxRQUFRQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQ0MsZ0dBQW9DO0FBRTdFSCw4REFBb0IsR0FBR0csZ0dBQW9DLElBQUk7QUFFaEQsU0FBU0k7O0lBQ3RCLE1BQU1DLGVBQWVWLDZDQUFNQSxDQUFpQjtJQUM1QyxNQUFNVyxjQUFjWCw2Q0FBTUEsQ0FBc0I7SUFDaEQsTUFBTSxDQUFDWSxVQUFVQyxZQUFZLEdBQUdaLCtDQUFRQSxDQUFnQjtJQUV4RCxtREFBbUQ7SUFDbkRGLGdEQUFTQSxDQUFDO1FBQ1JJLFFBQVFDLEdBQUcsQ0FBQztRQUNaRCxRQUFRQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQ00sYUFBYUksT0FBTztRQUN2RFgsUUFBUUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUNPLFlBQVlHLE9BQU87UUFFekQsSUFBSUosYUFBYUksT0FBTyxJQUFJLENBQUNILFlBQVlHLE9BQU8sRUFBRTtZQUNoRCxJQUFJO2dCQUNGSCxZQUFZRyxPQUFPLEdBQUcsSUFBSVosc0RBQVksQ0FBQztvQkFDckNhLFdBQVdMLGFBQWFJLE9BQU87b0JBQy9CRSxPQUFPO29CQUNQQyxRQUFRO3dCQUFDLENBQUM7d0JBQVU7cUJBQVE7b0JBQzVCQyxNQUFNO29CQUNOQyxPQUFPO29CQUNQQyxTQUFTO2dCQUNYO2dCQUVBVCxZQUFZRyxPQUFPLENBQUNPLEVBQUUsQ0FBQyxRQUFRO29CQUM3QmxCLFFBQVFDLEdBQUcsQ0FBQztnQkFDZDtnQkFFQU8sWUFBWUcsT0FBTyxDQUFDTyxFQUFFLENBQUMsU0FBUyxDQUFDQzt3QkFFbkJBO29CQURabkIsUUFBUW9CLEtBQUssQ0FBQyxpQkFBaUJEO29CQUMvQlQsWUFBWVMsRUFBQUEsV0FBQUEsRUFBRUMsS0FBSyxjQUFQRCwrQkFBQUEsU0FBU0UsT0FBTyxLQUFJO2dCQUNsQztZQUVGLEVBQUUsT0FBT0QsT0FBTztnQkFDZHBCLFFBQVFvQixLQUFLLENBQUMsNkJBQTZCQTtnQkFDM0NWLFlBQVlVLGlCQUFpQkUsUUFBUUYsTUFBTUMsT0FBTyxHQUFHO1lBQ3ZEO1FBQ0Y7UUFFQSxPQUFPO2dCQUVMYjtZQURBUixRQUFRQyxHQUFHLENBQUM7YUFDWk8sdUJBQUFBLFlBQVlHLE9BQU8sY0FBbkJILDJDQUFBQSxxQkFBcUJlLE1BQU07UUFDN0I7SUFDRixHQUFHLEVBQUU7SUFFTCxxQkFDRSw4REFBQ0M7UUFBSUMsV0FBVTs7MEJBQ2IsOERBQUNEO2dCQUNDRSxLQUFLbkI7Z0JBQ0xrQixXQUFVO2dCQUNWWixPQUFPO29CQUFFYyxZQUFZO2dCQUFVOzs7Ozs7WUFHaENsQiwwQkFDQyw4REFBQ2U7Z0JBQUlDLFdBQVU7O29CQUE2RDtvQkFDbEVoQjs7Ozs7OzswQkFJWiw4REFBQ2U7Z0JBQUlDLFdBQVU7MEJBQ2IsNEVBQUNHO29CQUNDQyxTQUFTLElBQU03QixRQUFRQyxHQUFHLENBQUMseUJBQXlCTyxZQUFZRyxPQUFPO29CQUN2RWMsV0FBVTs4QkFDWDs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNVDtHQW5Fd0JuQjtLQUFBQSIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9zcmMvY29tcG9uZW50cy9NYXAudHN4P2IxNjUiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBjbGllbnQnO1xyXG5cclxuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgbWFwYm94Z2wgZnJvbSAnbWFwYm94LWdsJztcclxuaW1wb3J0ICdtYXBib3gtZ2wvZGlzdC9tYXBib3gtZ2wuY3NzJztcclxuXHJcbi8vIERlYnVnIHRva2VuIGxvYWRpbmdcclxuY29uc29sZS5sb2coJ01hcGJveCB0b2tlbiBhdmFpbGFibGU6JywgISFwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19NQVBCT1hfVE9LRU4pO1xyXG5cclxubWFwYm94Z2wuYWNjZXNzVG9rZW4gPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19NQVBCT1hfVE9LRU4gfHwgJyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBNYXAoKSB7XHJcbiAgY29uc3QgbWFwQ29udGFpbmVyID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKTtcclxuICBjb25zdCBtYXBJbnN0YW5jZSA9IHVzZVJlZjxtYXBib3hnbC5NYXAgfCBudWxsPihudWxsKTtcclxuICBjb25zdCBbbWFwRXJyb3IsIHNldE1hcEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xyXG5cclxuICAvLyBJbml0aWFsaXplIG1hcCB3aXRoIG1vcmUgZGV0YWlsZWQgZXJyb3IgaGFuZGxpbmdcclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgY29uc29sZS5sb2coJ0luaXRpYWxpemluZyBtYXAuLi4nKTtcclxuICAgIGNvbnNvbGUubG9nKCdDb250YWluZXIgZXhpc3RzOicsICEhbWFwQ29udGFpbmVyLmN1cnJlbnQpO1xyXG4gICAgY29uc29sZS5sb2coJ01hcCBpbnN0YW5jZSBleGlzdHM6JywgISFtYXBJbnN0YW5jZS5jdXJyZW50KTtcclxuXHJcbiAgICBpZiAobWFwQ29udGFpbmVyLmN1cnJlbnQgJiYgIW1hcEluc3RhbmNlLmN1cnJlbnQpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBtYXBJbnN0YW5jZS5jdXJyZW50ID0gbmV3IG1hcGJveGdsLk1hcCh7XHJcbiAgICAgICAgICBjb250YWluZXI6IG1hcENvbnRhaW5lci5jdXJyZW50LFxyXG4gICAgICAgICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2RhcmstdjExJyxcclxuICAgICAgICAgIGNlbnRlcjogWy0xMDUuMDE3OCwgMzkuNzM5Ml0sXHJcbiAgICAgICAgICB6b29tOiAxNCxcclxuICAgICAgICAgIHBpdGNoOiA0NSxcclxuICAgICAgICAgIGJlYXJpbmc6IDBcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbWFwSW5zdGFuY2UuY3VycmVudC5vbignbG9hZCcsICgpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCdNYXAgbG9hZGVkIHN1Y2Nlc3NmdWxseScpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBtYXBJbnN0YW5jZS5jdXJyZW50Lm9uKCdlcnJvcicsIChlKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdNYXBib3ggZXJyb3I6JywgZSk7XHJcbiAgICAgICAgICBzZXRNYXBFcnJvcihlLmVycm9yPy5tZXNzYWdlIHx8ICdVbmtub3duIG1hcCBlcnJvcicpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdNYXAgaW5pdGlhbGl6YXRpb24gZXJyb3I6JywgZXJyb3IpO1xyXG4gICAgICAgIHNldE1hcEVycm9yKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdDbGVhbmluZyB1cCBtYXAuLi4nKTtcclxuICAgICAgbWFwSW5zdGFuY2UuY3VycmVudD8ucmVtb3ZlKCk7XHJcbiAgICB9O1xyXG4gIH0sIFtdKTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmUgdy1mdWxsIGgtZnVsbFwiPlxyXG4gICAgICA8ZGl2IFxyXG4gICAgICAgIHJlZj17bWFwQ29udGFpbmVyfSBcclxuICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSBpbnNldC0wXCJcclxuICAgICAgICBzdHlsZT17eyBiYWNrZ3JvdW5kOiAnIzI0MjQyNCcgfX0gLy8gQWRkIHZpc2libGUgYmFja2dyb3VuZFxyXG4gICAgICAvPlxyXG4gICAgICBcclxuICAgICAge21hcEVycm9yICYmIChcclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC00IGxlZnQtNCBiZy1yZWQtNTAwIHRleHQtd2hpdGUgcC00IHJvdW5kZWQtbWRcIj5cclxuICAgICAgICAgIEVycm9yOiB7bWFwRXJyb3J9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC00IGxlZnQtNFwiPlxyXG4gICAgICAgIDxidXR0b25cclxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGNvbnNvbGUubG9nKCdDdXJyZW50IG1hcCBpbnN0YW5jZTonLCBtYXBJbnN0YW5jZS5jdXJyZW50KX1cclxuICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTQgcHktMiBiZy1zdG9uZS04MDAgaG92ZXI6Ymctc3RvbmUtNzAwIHRleHQtd2hpdGUgcm91bmRlZC1tZCBzaGFkb3ctbGdcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIFBsYW4gUm91dGVcclxuICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICApO1xyXG59XHJcbiJdLCJuYW1lcyI6WyJ1c2VFZmZlY3QiLCJ1c2VSZWYiLCJ1c2VTdGF0ZSIsIm1hcGJveGdsIiwiY29uc29sZSIsImxvZyIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19NQVBCT1hfVE9LRU4iLCJhY2Nlc3NUb2tlbiIsIk1hcCIsIm1hcENvbnRhaW5lciIsIm1hcEluc3RhbmNlIiwibWFwRXJyb3IiLCJzZXRNYXBFcnJvciIsImN1cnJlbnQiLCJjb250YWluZXIiLCJzdHlsZSIsImNlbnRlciIsInpvb20iLCJwaXRjaCIsImJlYXJpbmciLCJvbiIsImUiLCJlcnJvciIsIm1lc3NhZ2UiLCJFcnJvciIsInJlbW92ZSIsImRpdiIsImNsYXNzTmFtZSIsInJlZiIsImJhY2tncm91bmQiLCJidXR0b24iLCJvbkNsaWNrIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/components/Map.tsx\n"));

/***/ })

});