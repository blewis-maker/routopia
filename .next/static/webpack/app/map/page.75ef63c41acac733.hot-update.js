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

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ Map; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mapbox-gl */ \"(app-pages-browser)/./node_modules/mapbox-gl/dist/mapbox-gl.js\");\n/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(mapbox_gl__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var mapbox_gl_dist_mapbox_gl_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! mapbox-gl/dist/mapbox-gl.css */ \"(app-pages-browser)/./node_modules/mapbox-gl/dist/mapbox-gl.css\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\n\n(mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().accessToken) = \"pk.eyJ1Ijoicm91dG9waWEtYWkiLCJhIjoiY200MWkzb25xMHFtcjJxcHRmOTE3NTlrNSJ9.d2Ds8SJXnQzc2W1o50D76Q\";\nfunction Map() {\n    _s();\n    const mapContainer = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    const mapInstance = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    const locationMarker = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        if (!mapContainer.current) return;\n        console.log(\"Initializing map...\");\n        const map = new (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().Map)({\n            container: mapContainer.current,\n            style: \"mapbox://styles/mapbox/dark-v11\",\n            center: [\n                -105.2705,\n                40.0150\n            ],\n            zoom: 14\n        });\n        mapInstance.current = map;\n        // Wait for map to load before getting location\n        map.on(\"load\", ()=>{\n            console.log(\"Map loaded, getting location...\");\n            if (\"geolocation\" in navigator) {\n                navigator.geolocation.getCurrentPosition((position)=>{\n                    const location = [\n                        position.coords.longitude,\n                        position.coords.latitude\n                    ];\n                    console.log(\"Location received:\", location);\n                    // Add a simple marker first\n                    const marker = new (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().Marker)({\n                        color: \"#10b981\" // Teal color\n                    }).setLngLat(location).addTo(map);\n                    console.log(\"Marker added at:\", marker.getLngLat());\n                    locationMarker.current = marker;\n                    // Move map to location\n                    map.flyTo({\n                        center: location,\n                        zoom: 15,\n                        essential: true\n                    });\n                    // Add bounce class after marker is added\n                    const markerEl = marker.getElement();\n                    markerEl.className += \" marker-wrapper\";\n                    console.log(\"Added bounce class to marker\");\n                }, (error)=>{\n                    console.error(\"Geolocation error:\", error);\n                }, {\n                    enableHighAccuracy: true,\n                    timeout: 5000,\n                    maximumAge: 0\n                });\n            }\n        });\n        return ()=>{\n            if (locationMarker.current) {\n                locationMarker.current.remove();\n            }\n            if (mapInstance.current) {\n                mapInstance.current.remove();\n            }\n        };\n    }, []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"relative w-full h-full\",\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n            ref: mapContainer,\n            className: \"absolute inset-0\"\n        }, void 0, false, {\n            fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n            lineNumber: 87,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n        lineNumber: 86,\n        columnNumber: 5\n    }, this);\n}\n_s(Map, \"toWG1rtjtvp1jloqfPLhkJ9O8pQ=\");\n_c = Map;\nvar _c;\n$RefreshReg$(_c, \"Map\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9jb21wb25lbnRzL01hcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBRTBDO0FBQ1Q7QUFDSztBQUV0Q0UsOERBQW9CLEdBQUdFLGdHQUFvQztBQUU1QyxTQUFTRzs7SUFDdEIsTUFBTUMsZUFBZVAsNkNBQU1BLENBQWlCO0lBQzVDLE1BQU1RLGNBQWNSLDZDQUFNQSxDQUFzQjtJQUNoRCxNQUFNUyxpQkFBaUJULDZDQUFNQSxDQUF5QjtJQUV0REQsZ0RBQVNBLENBQUM7UUFDUixJQUFJLENBQUNRLGFBQWFHLE9BQU8sRUFBRTtRQUUzQkMsUUFBUUMsR0FBRyxDQUFDO1FBRVosTUFBTUMsTUFBTSxJQUFJWixzREFBWSxDQUFDO1lBQzNCYSxXQUFXUCxhQUFhRyxPQUFPO1lBQy9CSyxPQUFPO1lBQ1BDLFFBQVE7Z0JBQUMsQ0FBQztnQkFBVTthQUFRO1lBQzVCQyxNQUFNO1FBQ1I7UUFFQVQsWUFBWUUsT0FBTyxHQUFHRztRQUV0QiwrQ0FBK0M7UUFDL0NBLElBQUlLLEVBQUUsQ0FBQyxRQUFRO1lBQ2JQLFFBQVFDLEdBQUcsQ0FBQztZQUVaLElBQUksaUJBQWlCTyxXQUFXO2dCQUM5QkEsVUFBVUMsV0FBVyxDQUFDQyxrQkFBa0IsQ0FDdEMsQ0FBQ0M7b0JBQ0MsTUFBTUMsV0FBNkI7d0JBQ2pDRCxTQUFTRSxNQUFNLENBQUNDLFNBQVM7d0JBQ3pCSCxTQUFTRSxNQUFNLENBQUNFLFFBQVE7cUJBQ3pCO29CQUNEZixRQUFRQyxHQUFHLENBQUMsc0JBQXNCVztvQkFFbEMsNEJBQTRCO29CQUM1QixNQUFNSSxTQUFTLElBQUkxQix5REFBZSxDQUFDO3dCQUNqQzRCLE9BQU8sVUFBVSxhQUFhO29CQUNoQyxHQUNHQyxTQUFTLENBQUNQLFVBQ1ZRLEtBQUssQ0FBQ2xCO29CQUVURixRQUFRQyxHQUFHLENBQUMsb0JBQW9CZSxPQUFPSyxTQUFTO29CQUNoRHZCLGVBQWVDLE9BQU8sR0FBR2lCO29CQUV6Qix1QkFBdUI7b0JBQ3ZCZCxJQUFJb0IsS0FBSyxDQUFDO3dCQUNSakIsUUFBUU87d0JBQ1JOLE1BQU07d0JBQ05pQixXQUFXO29CQUNiO29CQUVBLHlDQUF5QztvQkFDekMsTUFBTUMsV0FBV1IsT0FBT1MsVUFBVTtvQkFDbENELFNBQVNFLFNBQVMsSUFBSTtvQkFDdEIxQixRQUFRQyxHQUFHLENBQUM7Z0JBQ2QsR0FDQSxDQUFDMEI7b0JBQ0MzQixRQUFRMkIsS0FBSyxDQUFDLHNCQUFzQkE7Z0JBQ3RDLEdBQ0E7b0JBQ0VDLG9CQUFvQjtvQkFDcEJDLFNBQVM7b0JBQ1RDLFlBQVk7Z0JBQ2Q7WUFFSjtRQUNGO1FBRUEsT0FBTztZQUNMLElBQUloQyxlQUFlQyxPQUFPLEVBQUU7Z0JBQzFCRCxlQUFlQyxPQUFPLENBQUNnQyxNQUFNO1lBQy9CO1lBQ0EsSUFBSWxDLFlBQVlFLE9BQU8sRUFBRTtnQkFDdkJGLFlBQVlFLE9BQU8sQ0FBQ2dDLE1BQU07WUFDNUI7UUFDRjtJQUNGLEdBQUcsRUFBRTtJQUVMLHFCQUNFLDhEQUFDQztRQUFJTixXQUFVO2tCQUNiLDRFQUFDTTtZQUFJQyxLQUFLckM7WUFBYzhCLFdBQVU7Ozs7Ozs7Ozs7O0FBR3hDO0dBakZ3Qi9CO0tBQUFBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vX05fRS8uL3NyYy9jb21wb25lbnRzL01hcC50c3g/YjE2NSJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGNsaWVudCc7XHJcblxyXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IG1hcGJveGdsIGZyb20gJ21hcGJveC1nbCc7XHJcbmltcG9ydCAnbWFwYm94LWdsL2Rpc3QvbWFwYm94LWdsLmNzcyc7XHJcblxyXG5tYXBib3hnbC5hY2Nlc3NUb2tlbiA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX01BUEJPWF9UT0tFTiBhcyBzdHJpbmc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBNYXAoKSB7XHJcbiAgY29uc3QgbWFwQ29udGFpbmVyID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKTtcclxuICBjb25zdCBtYXBJbnN0YW5jZSA9IHVzZVJlZjxtYXBib3hnbC5NYXAgfCBudWxsPihudWxsKTtcclxuICBjb25zdCBsb2NhdGlvbk1hcmtlciA9IHVzZVJlZjxtYXBib3hnbC5NYXJrZXIgfCBudWxsPihudWxsKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmICghbWFwQ29udGFpbmVyLmN1cnJlbnQpIHJldHVybjtcclxuXHJcbiAgICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIG1hcC4uLicpO1xyXG4gICAgXHJcbiAgICBjb25zdCBtYXAgPSBuZXcgbWFwYm94Z2wuTWFwKHtcclxuICAgICAgY29udGFpbmVyOiBtYXBDb250YWluZXIuY3VycmVudCxcclxuICAgICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2RhcmstdjExJyxcclxuICAgICAgY2VudGVyOiBbLTEwNS4yNzA1LCA0MC4wMTUwXSxcclxuICAgICAgem9vbTogMTRcclxuICAgIH0pO1xyXG5cclxuICAgIG1hcEluc3RhbmNlLmN1cnJlbnQgPSBtYXA7XHJcblxyXG4gICAgLy8gV2FpdCBmb3IgbWFwIHRvIGxvYWQgYmVmb3JlIGdldHRpbmcgbG9jYXRpb25cclxuICAgIG1hcC5vbignbG9hZCcsICgpID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ01hcCBsb2FkZWQsIGdldHRpbmcgbG9jYXRpb24uLi4nKTtcclxuICAgICAgXHJcbiAgICAgIGlmIChcImdlb2xvY2F0aW9uXCIgaW4gbmF2aWdhdG9yKSB7XHJcbiAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihcclxuICAgICAgICAgIChwb3NpdGlvbikgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBsb2NhdGlvbjogW251bWJlciwgbnVtYmVyXSA9IFtcclxuICAgICAgICAgICAgICBwb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlLFxyXG4gICAgICAgICAgICAgIHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZVxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTG9jYXRpb24gcmVjZWl2ZWQ6JywgbG9jYXRpb24pO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGEgc2ltcGxlIG1hcmtlciBmaXJzdFxyXG4gICAgICAgICAgICBjb25zdCBtYXJrZXIgPSBuZXcgbWFwYm94Z2wuTWFya2VyKHtcclxuICAgICAgICAgICAgICBjb2xvcjogJyMxMGI5ODEnIC8vIFRlYWwgY29sb3JcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAuc2V0TG5nTGF0KGxvY2F0aW9uKVxyXG4gICAgICAgICAgICAgIC5hZGRUbyhtYXApO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ01hcmtlciBhZGRlZCBhdDonLCBtYXJrZXIuZ2V0TG5nTGF0KCkpO1xyXG4gICAgICAgICAgICBsb2NhdGlvbk1hcmtlci5jdXJyZW50ID0gbWFya2VyO1xyXG5cclxuICAgICAgICAgICAgLy8gTW92ZSBtYXAgdG8gbG9jYXRpb25cclxuICAgICAgICAgICAgbWFwLmZseVRvKHtcclxuICAgICAgICAgICAgICBjZW50ZXI6IGxvY2F0aW9uLFxyXG4gICAgICAgICAgICAgIHpvb206IDE1LFxyXG4gICAgICAgICAgICAgIGVzc2VudGlhbDogdHJ1ZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBib3VuY2UgY2xhc3MgYWZ0ZXIgbWFya2VyIGlzIGFkZGVkXHJcbiAgICAgICAgICAgIGNvbnN0IG1hcmtlckVsID0gbWFya2VyLmdldEVsZW1lbnQoKTtcclxuICAgICAgICAgICAgbWFya2VyRWwuY2xhc3NOYW1lICs9ICcgbWFya2VyLXdyYXBwZXInO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnQWRkZWQgYm91bmNlIGNsYXNzIHRvIG1hcmtlcicpO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdHZW9sb2NhdGlvbiBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBlbmFibGVIaWdoQWNjdXJhY3k6IHRydWUsXHJcbiAgICAgICAgICAgIHRpbWVvdXQ6IDUwMDAsXHJcbiAgICAgICAgICAgIG1heGltdW1BZ2U6IDBcclxuICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBpZiAobG9jYXRpb25NYXJrZXIuY3VycmVudCkge1xyXG4gICAgICAgIGxvY2F0aW9uTWFya2VyLmN1cnJlbnQucmVtb3ZlKCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG1hcEluc3RhbmNlLmN1cnJlbnQpIHtcclxuICAgICAgICBtYXBJbnN0YW5jZS5jdXJyZW50LnJlbW92ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH0sIFtdKTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmUgdy1mdWxsIGgtZnVsbFwiPlxyXG4gICAgICA8ZGl2IHJlZj17bWFwQ29udGFpbmVyfSBjbGFzc05hbWU9XCJhYnNvbHV0ZSBpbnNldC0wXCIgLz5cclxuICAgIDwvZGl2PlxyXG4gICk7XHJcbn1cclxuIl0sIm5hbWVzIjpbInVzZUVmZmVjdCIsInVzZVJlZiIsIm1hcGJveGdsIiwiYWNjZXNzVG9rZW4iLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfTUFQQk9YX1RPS0VOIiwiTWFwIiwibWFwQ29udGFpbmVyIiwibWFwSW5zdGFuY2UiLCJsb2NhdGlvbk1hcmtlciIsImN1cnJlbnQiLCJjb25zb2xlIiwibG9nIiwibWFwIiwiY29udGFpbmVyIiwic3R5bGUiLCJjZW50ZXIiLCJ6b29tIiwib24iLCJuYXZpZ2F0b3IiLCJnZW9sb2NhdGlvbiIsImdldEN1cnJlbnRQb3NpdGlvbiIsInBvc2l0aW9uIiwibG9jYXRpb24iLCJjb29yZHMiLCJsb25naXR1ZGUiLCJsYXRpdHVkZSIsIm1hcmtlciIsIk1hcmtlciIsImNvbG9yIiwic2V0TG5nTGF0IiwiYWRkVG8iLCJnZXRMbmdMYXQiLCJmbHlUbyIsImVzc2VudGlhbCIsIm1hcmtlckVsIiwiZ2V0RWxlbWVudCIsImNsYXNzTmFtZSIsImVycm9yIiwiZW5hYmxlSGlnaEFjY3VyYWN5IiwidGltZW91dCIsIm1heGltdW1BZ2UiLCJyZW1vdmUiLCJkaXYiLCJyZWYiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/components/Map.tsx\n"));

/***/ })

});