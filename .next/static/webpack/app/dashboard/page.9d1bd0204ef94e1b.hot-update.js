"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("app/dashboard/page",{

/***/ "(app-pages-browser)/./src/components/Map.tsx":
/*!********************************!*\
  !*** ./src/components/Map.tsx ***!
  \********************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ Map; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mapbox-gl */ \"(app-pages-browser)/./node_modules/mapbox-gl/dist/mapbox-gl.js\");\n/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(mapbox_gl__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var mapbox_gl_dist_mapbox_gl_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! mapbox-gl/dist/mapbox-gl.css */ \"(app-pages-browser)/./node_modules/mapbox-gl/dist/mapbox-gl.css\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\n\n(mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().accessToken) = \"pk.eyJ1Ijoicm91dG9waWEtYWkiLCJhIjoiY200MWkzb25xMHFtcjJxcHRmOTE3NTlrNSJ9.d2Ds8SJXnQzc2W1o50D76Q\";\nfunction Map() {\n    _s();\n    const mapContainer = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    const mapInstance = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    const locationMarker = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        if (!mapContainer.current) return;\n        // Initialize map\n        if (!mapInstance.current) {\n            mapInstance.current = new (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().Map)({\n                container: mapContainer.current,\n                style: \"mapbox://styles/mapbox/dark-v11\",\n                center: [\n                    -105.2705,\n                    40.0150\n                ],\n                zoom: 14\n            });\n            // Wait for map to load before getting location\n            mapInstance.current.on(\"load\", ()=>{\n                if (\"geolocation\" in navigator) {\n                    navigator.geolocation.getCurrentPosition((position)=>{\n                        var // Center map on location\n                        _mapInstance_current;\n                        const location = [\n                            position.coords.longitude,\n                            position.coords.latitude\n                        ];\n                        // Create marker elements\n                        const markerWrapper = document.createElement(\"div\");\n                        markerWrapper.className = \"marker-wrapper\";\n                        markerWrapper.style.zIndex = \"1\"; // Ensure marker is above map\n                        const markerElement = document.createElement(\"div\");\n                        markerElement.className = \"location-marker\";\n                        markerWrapper.appendChild(markerElement);\n                        // Create new marker\n                        locationMarker.current = new (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().Marker)({\n                            element: markerWrapper,\n                            anchor: \"bottom\"\n                        }).setLngLat(location).addTo(mapInstance.current);\n                        (_mapInstance_current = mapInstance.current) === null || _mapInstance_current === void 0 ? void 0 : _mapInstance_current.flyTo({\n                            center: location,\n                            zoom: 15,\n                            essential: true\n                        });\n                    }, (error)=>console.error(\"Error getting location:\", error));\n                }\n            });\n        }\n        return ()=>{\n            if (mapInstance.current) {\n                mapInstance.current.remove();\n                mapInstance.current = null;\n            }\n        };\n    }, []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"absolute inset-0 w-full h-full\",\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            ref: mapContainer,\n            className: \"w-full h-full\"\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n            lineNumber: 76,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n        lineNumber: 75,\n        columnNumber: 5\n    }, this);\n}\n_s(Map, \"toWG1rtjtvp1jloqfPLhkJ9O8pQ=\");\n_c = Map;\nvar _c;\n$RefreshReg$(_c, \"Map\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9jb21wb25lbnRzL01hcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBRW9EO0FBQ25CO0FBQ0s7QUFFdENFLDhEQUFvQixHQUFHRSxnR0FBb0M7QUFFNUMsU0FBU0c7O0lBQ3RCLE1BQU1DLGVBQWVQLDZDQUFNQSxDQUFpQjtJQUM1QyxNQUFNUSxjQUFjUiw2Q0FBTUEsQ0FBc0I7SUFDaEQsTUFBTVMsaUJBQWlCVCw2Q0FBTUEsQ0FBeUI7SUFFdERELGdEQUFTQSxDQUFDO1FBQ1IsSUFBSSxDQUFDUSxhQUFhRyxPQUFPLEVBQUU7UUFFM0IsaUJBQWlCO1FBQ2pCLElBQUksQ0FBQ0YsWUFBWUUsT0FBTyxFQUFFO1lBQ3hCRixZQUFZRSxPQUFPLEdBQUcsSUFBSVQsc0RBQVksQ0FBQztnQkFDckNVLFdBQVdKLGFBQWFHLE9BQU87Z0JBQy9CRSxPQUFPO2dCQUNQQyxRQUFRO29CQUFDLENBQUM7b0JBQVU7aUJBQVE7Z0JBQzVCQyxNQUFNO1lBQ1I7WUFFQSwrQ0FBK0M7WUFDL0NOLFlBQVlFLE9BQU8sQ0FBQ0ssRUFBRSxDQUFDLFFBQVE7Z0JBQzdCLElBQUksaUJBQWlCQyxXQUFXO29CQUM5QkEsVUFBVUMsV0FBVyxDQUFDQyxrQkFBa0IsQ0FDdEMsQ0FBQ0M7NEJBdUJDLHlCQUF5Qjt3QkFDekJYO3dCQXZCQSxNQUFNWSxXQUE2Qjs0QkFDakNELFNBQVNFLE1BQU0sQ0FBQ0MsU0FBUzs0QkFDekJILFNBQVNFLE1BQU0sQ0FBQ0UsUUFBUTt5QkFDekI7d0JBRUQseUJBQXlCO3dCQUN6QixNQUFNQyxnQkFBZ0JDLFNBQVNDLGFBQWEsQ0FBQzt3QkFDN0NGLGNBQWNHLFNBQVMsR0FBRzt3QkFDMUJILGNBQWNaLEtBQUssQ0FBQ2dCLE1BQU0sR0FBRyxLQUFNLDZCQUE2Qjt3QkFFaEUsTUFBTUMsZ0JBQWdCSixTQUFTQyxhQUFhLENBQUM7d0JBQzdDRyxjQUFjRixTQUFTLEdBQUc7d0JBQzFCSCxjQUFjTSxXQUFXLENBQUNEO3dCQUUxQixvQkFBb0I7d0JBQ3BCcEIsZUFBZUMsT0FBTyxHQUFHLElBQUlULHlEQUFlLENBQUM7NEJBQzNDK0IsU0FBU1I7NEJBQ1RTLFFBQVE7d0JBQ1YsR0FDR0MsU0FBUyxDQUFDZCxVQUNWZSxLQUFLLENBQUMzQixZQUFZRSxPQUFPO3lCQUc1QkYsdUJBQUFBLFlBQVlFLE9BQU8sY0FBbkJGLDJDQUFBQSxxQkFBcUI0QixLQUFLLENBQUM7NEJBQ3pCdkIsUUFBUU87NEJBQ1JOLE1BQU07NEJBQ051QixXQUFXO3dCQUNiO29CQUNGLEdBQ0EsQ0FBQ0MsUUFBVUMsUUFBUUQsS0FBSyxDQUFDLDJCQUEyQkE7Z0JBRXhEO1lBQ0Y7UUFDRjtRQUVBLE9BQU87WUFDTCxJQUFJOUIsWUFBWUUsT0FBTyxFQUFFO2dCQUN2QkYsWUFBWUUsT0FBTyxDQUFDOEIsTUFBTTtnQkFDMUJoQyxZQUFZRSxPQUFPLEdBQUc7WUFDeEI7UUFDRjtJQUNGLEdBQUcsRUFBRTtJQUVMLHFCQUNFLDhEQUFDK0I7UUFBSWQsV0FBVTtrQkFDYiw0RUFBQ2M7WUFBSUMsS0FBS25DO1lBQWNvQixXQUFVOzs7Ozs7Ozs7OztBQUd4QztHQXRFd0JyQjtLQUFBQSIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi9zcmMvY29tcG9uZW50cy9NYXAudHN4P2IxNjUiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBjbGllbnQnO1xyXG5cclxuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgbWFwYm94Z2wgZnJvbSAnbWFwYm94LWdsJztcclxuaW1wb3J0ICdtYXBib3gtZ2wvZGlzdC9tYXBib3gtZ2wuY3NzJztcclxuXHJcbm1hcGJveGdsLmFjY2Vzc1Rva2VuID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfTUFQQk9YX1RPS0VOIGFzIHN0cmluZztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE1hcCgpIHtcclxuICBjb25zdCBtYXBDb250YWluZXIgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpO1xyXG4gIGNvbnN0IG1hcEluc3RhbmNlID0gdXNlUmVmPG1hcGJveGdsLk1hcCB8IG51bGw+KG51bGwpO1xyXG4gIGNvbnN0IGxvY2F0aW9uTWFya2VyID0gdXNlUmVmPG1hcGJveGdsLk1hcmtlciB8IG51bGw+KG51bGwpO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKCFtYXBDb250YWluZXIuY3VycmVudCkgcmV0dXJuO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgbWFwXHJcbiAgICBpZiAoIW1hcEluc3RhbmNlLmN1cnJlbnQpIHtcclxuICAgICAgbWFwSW5zdGFuY2UuY3VycmVudCA9IG5ldyBtYXBib3hnbC5NYXAoe1xyXG4gICAgICAgIGNvbnRhaW5lcjogbWFwQ29udGFpbmVyLmN1cnJlbnQsXHJcbiAgICAgICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2RhcmstdjExJyxcclxuICAgICAgICBjZW50ZXI6IFstMTA1LjI3MDUsIDQwLjAxNTBdLFxyXG4gICAgICAgIHpvb206IDE0XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gV2FpdCBmb3IgbWFwIHRvIGxvYWQgYmVmb3JlIGdldHRpbmcgbG9jYXRpb25cclxuICAgICAgbWFwSW5zdGFuY2UuY3VycmVudC5vbignbG9hZCcsICgpID0+IHtcclxuICAgICAgICBpZiAoXCJnZW9sb2NhdGlvblwiIGluIG5hdmlnYXRvcikge1xyXG4gICAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihcclxuICAgICAgICAgICAgKHBvc2l0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbG9jYXRpb246IFtudW1iZXIsIG51bWJlcl0gPSBbXHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb24uY29vcmRzLmxhdGl0dWRlXHJcbiAgICAgICAgICAgICAgXTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gQ3JlYXRlIG1hcmtlciBlbGVtZW50c1xyXG4gICAgICAgICAgICAgIGNvbnN0IG1hcmtlcldyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgICBtYXJrZXJXcmFwcGVyLmNsYXNzTmFtZSA9ICdtYXJrZXItd3JhcHBlcic7XHJcbiAgICAgICAgICAgICAgbWFya2VyV3JhcHBlci5zdHlsZS56SW5kZXggPSAnMSc7ICAvLyBFbnN1cmUgbWFya2VyIGlzIGFib3ZlIG1hcFxyXG4gICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIGNvbnN0IG1hcmtlckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgICBtYXJrZXJFbGVtZW50LmNsYXNzTmFtZSA9ICdsb2NhdGlvbi1tYXJrZXInO1xyXG4gICAgICAgICAgICAgIG1hcmtlcldyYXBwZXIuYXBwZW5kQ2hpbGQobWFya2VyRWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgbWFya2VyXHJcbiAgICAgICAgICAgICAgbG9jYXRpb25NYXJrZXIuY3VycmVudCA9IG5ldyBtYXBib3hnbC5NYXJrZXIoe1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudDogbWFya2VyV3JhcHBlcixcclxuICAgICAgICAgICAgICAgIGFuY2hvcjogJ2JvdHRvbSdcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnNldExuZ0xhdChsb2NhdGlvbilcclxuICAgICAgICAgICAgICAgIC5hZGRUbyhtYXBJbnN0YW5jZS5jdXJyZW50ISk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIENlbnRlciBtYXAgb24gbG9jYXRpb25cclxuICAgICAgICAgICAgICBtYXBJbnN0YW5jZS5jdXJyZW50Py5mbHlUbyh7XHJcbiAgICAgICAgICAgICAgICBjZW50ZXI6IGxvY2F0aW9uLFxyXG4gICAgICAgICAgICAgICAgem9vbTogMTUsXHJcbiAgICAgICAgICAgICAgICBlc3NlbnRpYWw6IHRydWVcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgKGVycm9yKSA9PiBjb25zb2xlLmVycm9yKCdFcnJvciBnZXR0aW5nIGxvY2F0aW9uOicsIGVycm9yKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIGlmIChtYXBJbnN0YW5jZS5jdXJyZW50KSB7XHJcbiAgICAgICAgbWFwSW5zdGFuY2UuY3VycmVudC5yZW1vdmUoKTtcclxuICAgICAgICBtYXBJbnN0YW5jZS5jdXJyZW50ID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9LCBbXSk7XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIGluc2V0LTAgdy1mdWxsIGgtZnVsbFwiPlxyXG4gICAgICA8ZGl2IHJlZj17bWFwQ29udGFpbmVyfSBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsXCIgLz5cclxuICAgIDwvZGl2PlxyXG4gICk7XHJcbn1cclxuIl0sIm5hbWVzIjpbInVzZUVmZmVjdCIsInVzZVJlZiIsIm1hcGJveGdsIiwiYWNjZXNzVG9rZW4iLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfTUFQQk9YX1RPS0VOIiwiTWFwIiwibWFwQ29udGFpbmVyIiwibWFwSW5zdGFuY2UiLCJsb2NhdGlvbk1hcmtlciIsImN1cnJlbnQiLCJjb250YWluZXIiLCJzdHlsZSIsImNlbnRlciIsInpvb20iLCJvbiIsIm5hdmlnYXRvciIsImdlb2xvY2F0aW9uIiwiZ2V0Q3VycmVudFBvc2l0aW9uIiwicG9zaXRpb24iLCJsb2NhdGlvbiIsImNvb3JkcyIsImxvbmdpdHVkZSIsImxhdGl0dWRlIiwibWFya2VyV3JhcHBlciIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTmFtZSIsInpJbmRleCIsIm1hcmtlckVsZW1lbnQiLCJhcHBlbmRDaGlsZCIsIk1hcmtlciIsImVsZW1lbnQiLCJhbmNob3IiLCJzZXRMbmdMYXQiLCJhZGRUbyIsImZseVRvIiwiZXNzZW50aWFsIiwiZXJyb3IiLCJjb25zb2xlIiwicmVtb3ZlIiwiZGl2IiwicmVmIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/components/Map.tsx\n"));

/***/ })

});