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

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ Map; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mapbox-gl */ \"(app-pages-browser)/./node_modules/mapbox-gl/dist/mapbox-gl.js\");\n/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(mapbox_gl__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var mapbox_gl_dist_mapbox_gl_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! mapbox-gl/dist/mapbox-gl.css */ \"(app-pages-browser)/./node_modules/mapbox-gl/dist/mapbox-gl.css\");\n/* harmony import */ var _RoutePanel__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./RoutePanel */ \"(app-pages-browser)/./src/components/RoutePanel.tsx\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\n\n\n// Debug token loading\nconst token = \"pk.eyJ1Ijoicm91dG9waWEtYWkiLCJhIjoiY200MWkzb25xMHFtcjJxcHRmOTE3NTlrNSJ9.d2Ds8SJXnQzc2W1o50D76Q\";\nif (!token) {\n    console.error(\"Mapbox token not found\");\n} else {\n    console.log(\"Mapbox token loaded\");\n    (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().accessToken) = token;\n}\nfunction Map() {\n    _s();\n    const mapContainer = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    const mapInstance = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    const [showSearch, setShowSearch] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const [startLocation, setStartLocation] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [endLocation, setEndLocation] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [waypoints, setWaypoints] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);\n    const [userLocation, setUserLocation] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    // Get user location\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        if (\"geolocation\" in navigator) {\n            navigator.geolocation.getCurrentPosition((position)=>{\n                const { latitude, longitude } = position.coords;\n                setUserLocation([\n                    longitude,\n                    latitude\n                ]);\n            }, (error)=>{\n                console.error(\"Error getting location:\", error);\n                // Default to Denver if location access is denied\n                setUserLocation([\n                    -104.9903,\n                    39.7392\n                ]);\n            });\n        }\n    }, []);\n    // Initialize map\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        if (!mapContainer.current || mapInstance.current) return;\n        if (!userLocation) return; // Wait for user location\n        console.log(\"Initializing map...\");\n        const map = new (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().Map)({\n            container: mapContainer.current,\n            style: \"mapbox://styles/mapbox/dark-v11\",\n            center: userLocation,\n            zoom: 13,\n            pitch: 45,\n            bearing: 0\n        });\n        // Add user location marker\n        new (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().Marker)({\n            color: \"#34d399\"\n        }).setLngLat(userLocation).addTo(map);\n        // Add navigation controls\n        map.addControl(new (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().NavigationControl)(), \"top-right\");\n        map.addControl(new (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().GeolocateControl)({\n            positionOptions: {\n                enableHighAccuracy: true\n            },\n            trackUserLocation: true\n        }));\n        map.on(\"load\", ()=>{\n            console.log(\"Map loaded successfully\");\n            // Add route layer if it doesn't exist\n            if (!map.getSource(\"route\")) {\n                map.addSource(\"route\", {\n                    type: \"geojson\",\n                    data: {\n                        type: \"Feature\",\n                        properties: {},\n                        geometry: {\n                            type: \"LineString\",\n                            coordinates: []\n                        }\n                    }\n                });\n                map.addLayer({\n                    id: \"route\",\n                    type: \"line\",\n                    source: \"route\",\n                    layout: {\n                        \"line-join\": \"round\",\n                        \"line-cap\": \"round\"\n                    },\n                    paint: {\n                        \"line-color\": \"#34d399\",\n                        \"line-width\": 4\n                    }\n                });\n            }\n        });\n        mapInstance.current = map;\n        return ()=>{\n            console.log(\"Cleaning up map\");\n            map.remove();\n            mapInstance.current = null;\n        };\n    }, [\n        userLocation\n    ]); // Now depends on userLocation\n    const handleLocationSelect = (location, type)=>{\n        if (!mapInstance.current) return;\n        mapInstance.current.flyTo({\n            center: location.coordinates,\n            zoom: 14,\n            essential: true\n        });\n        switch(type){\n            case \"start\":\n                setStartLocation(location);\n                break;\n            case \"end\":\n                setEndLocation(location);\n                break;\n            case \"waypoint\":\n                setWaypoints([\n                    ...waypoints,\n                    location\n                ]);\n                break;\n        }\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"relative w-full h-full\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                ref: mapContainer,\n                className: \"absolute inset-0\"\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                lineNumber: 146,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"absolute top-4 left-4 z-10\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                    onClick: ()=>setShowSearch(true),\n                    className: \"px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-md shadow-lg\",\n                    children: \"Plan Route\"\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                    lineNumber: 149,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                lineNumber: 148,\n                columnNumber: 7\n            }, this),\n            showSearch && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_RoutePanel__WEBPACK_IMPORTED_MODULE_4__.RoutePanel, {\n                onClose: ()=>setShowSearch(false),\n                startLocation: startLocation,\n                endLocation: endLocation,\n                waypoints: waypoints,\n                onStartLocationChange: (location)=>handleLocationSelect(location, \"start\"),\n                onEndLocationChange: (location)=>handleLocationSelect(location, \"end\"),\n                onWaypointAdd: (location)=>handleLocationSelect(location, \"waypoint\")\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                lineNumber: 158,\n                columnNumber: 9\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n        lineNumber: 145,\n        columnNumber: 5\n    }, this);\n}\n_s(Map, \"GNlteHgsiRwLAtgo34FVPJTNIxU=\");\n_c = Map;\nvar _c;\n$RefreshReg$(_c, \"Map\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9jb21wb25lbnRzL01hcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUVvRDtBQUNuQjtBQUNLO0FBRUk7QUFFMUMsc0JBQXNCO0FBQ3RCLE1BQU1LLFFBQVFDLGdHQUFvQztBQUNsRCxJQUFJLENBQUNELE9BQU87SUFDVkksUUFBUUMsS0FBSyxDQUFDO0FBQ2hCLE9BQU87SUFDTEQsUUFBUUUsR0FBRyxDQUFDO0lBQ1pSLDhEQUFvQixHQUFHRTtBQUN6QjtBQU9lLFNBQVNROztJQUN0QixNQUFNQyxlQUFlYiw2Q0FBTUEsQ0FBaUI7SUFDNUMsTUFBTWMsY0FBY2QsNkNBQU1BLENBQXNCO0lBQ2hELE1BQU0sQ0FBQ2UsWUFBWUMsY0FBYyxHQUFHZiwrQ0FBUUEsQ0FBQztJQUM3QyxNQUFNLENBQUNnQixlQUFlQyxpQkFBaUIsR0FBR2pCLCtDQUFRQSxDQUFrQjtJQUNwRSxNQUFNLENBQUNrQixhQUFhQyxlQUFlLEdBQUduQiwrQ0FBUUEsQ0FBa0I7SUFDaEUsTUFBTSxDQUFDb0IsV0FBV0MsYUFBYSxHQUFHckIsK0NBQVFBLENBQWEsRUFBRTtJQUN6RCxNQUFNLENBQUNzQixjQUFjQyxnQkFBZ0IsR0FBR3ZCLCtDQUFRQSxDQUEwQjtJQUUxRSxvQkFBb0I7SUFDcEJGLGdEQUFTQSxDQUFDO1FBQ1IsSUFBSSxpQkFBaUIwQixXQUFXO1lBQzlCQSxVQUFVQyxXQUFXLENBQUNDLGtCQUFrQixDQUN0QyxDQUFDQztnQkFDQyxNQUFNLEVBQUVDLFFBQVEsRUFBRUMsU0FBUyxFQUFFLEdBQUdGLFNBQVNHLE1BQU07Z0JBQy9DUCxnQkFBZ0I7b0JBQUNNO29CQUFXRDtpQkFBUztZQUN2QyxHQUNBLENBQUNwQjtnQkFDQ0QsUUFBUUMsS0FBSyxDQUFDLDJCQUEyQkE7Z0JBQ3pDLGlEQUFpRDtnQkFDakRlLGdCQUFnQjtvQkFBQyxDQUFDO29CQUFVO2lCQUFRO1lBQ3RDO1FBRUo7SUFDRixHQUFHLEVBQUU7SUFFTCxp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L01hcC50c3g/YjE2NSJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGNsaWVudCc7XHJcblxyXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCBtYXBib3hnbCBmcm9tICdtYXBib3gtZ2wnO1xyXG5pbXBvcnQgJ21hcGJveC1nbC9kaXN0L21hcGJveC1nbC5jc3MnO1xyXG5pbXBvcnQgeyBTZWFyY2hCb3ggfSBmcm9tICcuL1NlYXJjaEJveCc7XHJcbmltcG9ydCB7IFJvdXRlUGFuZWwgfSBmcm9tICcuL1JvdXRlUGFuZWwnO1xyXG5cclxuLy8gRGVidWcgdG9rZW4gbG9hZGluZ1xyXG5jb25zdCB0b2tlbiA9IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX01BUEJPWF9UT0tFTjtcclxuaWYgKCF0b2tlbikge1xyXG4gIGNvbnNvbGUuZXJyb3IoJ01hcGJveCB0b2tlbiBub3QgZm91bmQnKTtcclxufSBlbHNlIHtcclxuICBjb25zb2xlLmxvZygnTWFwYm94IHRva2VuIGxvYWRlZCcpO1xyXG4gIG1hcGJveGdsLmFjY2Vzc1Rva2VuID0gdG9rZW47XHJcbn1cclxuXHJcbmludGVyZmFjZSBMb2NhdGlvbiB7XHJcbiAgY29vcmRpbmF0ZXM6IFtudW1iZXIsIG51bWJlcl07XHJcbiAgYWRkcmVzczogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBNYXAoKSB7XHJcbiAgY29uc3QgbWFwQ29udGFpbmVyID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKTtcclxuICBjb25zdCBtYXBJbnN0YW5jZSA9IHVzZVJlZjxtYXBib3hnbC5NYXAgfCBudWxsPihudWxsKTtcclxuICBjb25zdCBbc2hvd1NlYXJjaCwgc2V0U2hvd1NlYXJjaF0gPSB1c2VTdGF0ZShmYWxzZSk7XHJcbiAgY29uc3QgW3N0YXJ0TG9jYXRpb24sIHNldFN0YXJ0TG9jYXRpb25dID0gdXNlU3RhdGU8TG9jYXRpb24gfCBudWxsPihudWxsKTtcclxuICBjb25zdCBbZW5kTG9jYXRpb24sIHNldEVuZExvY2F0aW9uXSA9IHVzZVN0YXRlPExvY2F0aW9uIHwgbnVsbD4obnVsbCk7XHJcbiAgY29uc3QgW3dheXBvaW50cywgc2V0V2F5cG9pbnRzXSA9IHVzZVN0YXRlPExvY2F0aW9uW10+KFtdKTtcclxuICBjb25zdCBbdXNlckxvY2F0aW9uLCBzZXRVc2VyTG9jYXRpb25dID0gdXNlU3RhdGU8W251bWJlciwgbnVtYmVyXSB8IG51bGw+KG51bGwpO1xyXG5cclxuICAvLyBHZXQgdXNlciBsb2NhdGlvblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAoXCJnZW9sb2NhdGlvblwiIGluIG5hdmlnYXRvcikge1xyXG4gICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKFxyXG4gICAgICAgIChwb3NpdGlvbikgPT4ge1xyXG4gICAgICAgICAgY29uc3QgeyBsYXRpdHVkZSwgbG9uZ2l0dWRlIH0gPSBwb3NpdGlvbi5jb29yZHM7XHJcbiAgICAgICAgICBzZXRVc2VyTG9jYXRpb24oW2xvbmdpdHVkZSwgbGF0aXR1ZGVdKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBsb2NhdGlvbjonLCBlcnJvcik7XHJcbiAgICAgICAgICAvLyBEZWZhdWx0IHRvIERlbnZlciBpZiBsb2NhdGlvbiBhY2Nlc3MgaXMgZGVuaWVkXHJcbiAgICAgICAgICBzZXRVc2VyTG9jYXRpb24oWy0xMDQuOTkwMywgMzkuNzM5Ml0pO1xyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgIH1cclxuICB9LCBbXSk7XHJcblxyXG4gIC8vIEluaXRpYWxpemUgbWFwXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmICghbWFwQ29udGFpbmVyLmN1cnJlbnQgfHwgbWFwSW5zdGFuY2UuY3VycmVudCkgcmV0dXJuO1xyXG4gICAgaWYgKCF1c2VyTG9jYXRpb24pIHJldHVybjsgLy8gV2FpdCBmb3IgdXNlciBsb2NhdGlvblxyXG5cclxuICAgIGNvbnNvbGUubG9nKCdJbml0aWFsaXppbmcgbWFwLi4uJyk7XHJcbiAgICBjb25zdCBtYXAgPSBuZXcgbWFwYm94Z2wuTWFwKHtcclxuICAgICAgY29udGFpbmVyOiBtYXBDb250YWluZXIuY3VycmVudCxcclxuICAgICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2RhcmstdjExJyxcclxuICAgICAgY2VudGVyOiB1c2VyTG9jYXRpb24sXHJcbiAgICAgIHpvb206IDEzLFxyXG4gICAgICBwaXRjaDogNDUsXHJcbiAgICAgIGJlYXJpbmc6IDBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFkZCB1c2VyIGxvY2F0aW9uIG1hcmtlclxyXG4gICAgbmV3IG1hcGJveGdsLk1hcmtlcih7XHJcbiAgICAgIGNvbG9yOiAnIzM0ZDM5OSdcclxuICAgIH0pXHJcbiAgICAgIC5zZXRMbmdMYXQodXNlckxvY2F0aW9uKVxyXG4gICAgICAuYWRkVG8obWFwKTtcclxuXHJcbiAgICAvLyBBZGQgbmF2aWdhdGlvbiBjb250cm9sc1xyXG4gICAgbWFwLmFkZENvbnRyb2wobmV3IG1hcGJveGdsLk5hdmlnYXRpb25Db250cm9sKCksICd0b3AtcmlnaHQnKTtcclxuICAgIG1hcC5hZGRDb250cm9sKG5ldyBtYXBib3hnbC5HZW9sb2NhdGVDb250cm9sKHtcclxuICAgICAgcG9zaXRpb25PcHRpb25zOiB7XHJcbiAgICAgICAgZW5hYmxlSGlnaEFjY3VyYWN5OiB0cnVlXHJcbiAgICAgIH0sXHJcbiAgICAgIHRyYWNrVXNlckxvY2F0aW9uOiB0cnVlXHJcbiAgICB9KSk7XHJcblxyXG4gICAgbWFwLm9uKCdsb2FkJywgKCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmxvZygnTWFwIGxvYWRlZCBzdWNjZXNzZnVsbHknKTtcclxuICAgICAgXHJcbiAgICAgIC8vIEFkZCByb3V0ZSBsYXllciBpZiBpdCBkb2Vzbid0IGV4aXN0XHJcbiAgICAgIGlmICghbWFwLmdldFNvdXJjZSgncm91dGUnKSkge1xyXG4gICAgICAgIG1hcC5hZGRTb3VyY2UoJ3JvdXRlJywge1xyXG4gICAgICAgICAgdHlwZTogJ2dlb2pzb24nLFxyXG4gICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9LFxyXG4gICAgICAgICAgICBnZW9tZXRyeToge1xyXG4gICAgICAgICAgICAgIHR5cGU6ICdMaW5lU3RyaW5nJyxcclxuICAgICAgICAgICAgICBjb29yZGluYXRlczogW11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBtYXAuYWRkTGF5ZXIoe1xyXG4gICAgICAgICAgaWQ6ICdyb3V0ZScsXHJcbiAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICBzb3VyY2U6ICdyb3V0ZScsXHJcbiAgICAgICAgICBsYXlvdXQ6IHtcclxuICAgICAgICAgICAgJ2xpbmUtam9pbic6ICdyb3VuZCcsXHJcbiAgICAgICAgICAgICdsaW5lLWNhcCc6ICdyb3VuZCdcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBwYWludDoge1xyXG4gICAgICAgICAgICAnbGluZS1jb2xvcic6ICcjMzRkMzk5JyxcclxuICAgICAgICAgICAgJ2xpbmUtd2lkdGgnOiA0XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIG1hcEluc3RhbmNlLmN1cnJlbnQgPSBtYXA7XHJcblxyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgY29uc29sZS5sb2coJ0NsZWFuaW5nIHVwIG1hcCcpO1xyXG4gICAgICBtYXAucmVtb3ZlKCk7XHJcbiAgICAgIG1hcEluc3RhbmNlLmN1cnJlbnQgPSBudWxsO1xyXG4gICAgfTtcclxuICB9LCBbdXNlckxvY2F0aW9uXSk7IC8vIE5vdyBkZXBlbmRzIG9uIHVzZXJMb2NhdGlvblxyXG5cclxuICBjb25zdCBoYW5kbGVMb2NhdGlvblNlbGVjdCA9IChsb2NhdGlvbjogTG9jYXRpb24sIHR5cGU6ICdzdGFydCcgfCAnZW5kJyB8ICd3YXlwb2ludCcpID0+IHtcclxuICAgIGlmICghbWFwSW5zdGFuY2UuY3VycmVudCkgcmV0dXJuO1xyXG5cclxuICAgIG1hcEluc3RhbmNlLmN1cnJlbnQuZmx5VG8oe1xyXG4gICAgICBjZW50ZXI6IGxvY2F0aW9uLmNvb3JkaW5hdGVzLFxyXG4gICAgICB6b29tOiAxNCxcclxuICAgICAgZXNzZW50aWFsOiB0cnVlXHJcbiAgICB9KTtcclxuXHJcbiAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgY2FzZSAnc3RhcnQnOlxyXG4gICAgICAgIHNldFN0YXJ0TG9jYXRpb24obG9jYXRpb24pO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdlbmQnOlxyXG4gICAgICAgIHNldEVuZExvY2F0aW9uKGxvY2F0aW9uKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnd2F5cG9pbnQnOlxyXG4gICAgICAgIHNldFdheXBvaW50cyhbLi4ud2F5cG9pbnRzLCBsb2NhdGlvbl0pO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIHctZnVsbCBoLWZ1bGxcIj5cclxuICAgICAgPGRpdiByZWY9e21hcENvbnRhaW5lcn0gY2xhc3NOYW1lPVwiYWJzb2x1dGUgaW5zZXQtMFwiIC8+XHJcbiAgICAgIFxyXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC00IGxlZnQtNCB6LTEwXCI+XHJcbiAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2hvd1NlYXJjaCh0cnVlKX1cclxuICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTQgcHktMiBiZy1zdG9uZS04MDAgaG92ZXI6Ymctc3RvbmUtNzAwIHRleHQtd2hpdGUgcm91bmRlZC1tZCBzaGFkb3ctbGdcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIFBsYW4gUm91dGVcclxuICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICB7c2hvd1NlYXJjaCAmJiAoXHJcbiAgICAgICAgPFJvdXRlUGFuZWxcclxuICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHNldFNob3dTZWFyY2goZmFsc2UpfVxyXG4gICAgICAgICAgc3RhcnRMb2NhdGlvbj17c3RhcnRMb2NhdGlvbn1cclxuICAgICAgICAgIGVuZExvY2F0aW9uPXtlbmRMb2NhdGlvbn1cclxuICAgICAgICAgIHdheXBvaW50cz17d2F5cG9pbnRzfVxyXG4gICAgICAgICAgb25TdGFydExvY2F0aW9uQ2hhbmdlPXsobG9jYXRpb24pID0+IGhhbmRsZUxvY2F0aW9uU2VsZWN0KGxvY2F0aW9uLCAnc3RhcnQnKX1cclxuICAgICAgICAgIG9uRW5kTG9jYXRpb25DaGFuZ2U9eyhsb2NhdGlvbikgPT4gaGFuZGxlTG9jYXRpb25TZWxlY3QobG9jYXRpb24sICdlbmQnKX1cclxuICAgICAgICAgIG9uV2F5cG9pbnRBZGQ9eyhsb2NhdGlvbikgPT4gaGFuZGxlTG9jYXRpb25TZWxlY3QobG9jYXRpb24sICd3YXlwb2ludCcpfVxyXG4gICAgICAgIC8+XHJcbiAgICAgICl9XHJcbiAgICA8L2Rpdj5cclxuICApO1xyXG59XHJcbiJdLCJuYW1lcyI6WyJ1c2VFZmZlY3QiLCJ1c2VSZWYiLCJ1c2VTdGF0ZSIsIm1hcGJveGdsIiwiUm91dGVQYW5lbCIsInRva2VuIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX01BUEJPWF9UT0tFTiIsImNvbnNvbGUiLCJlcnJvciIsImxvZyIsImFjY2Vzc1Rva2VuIiwiTWFwIiwibWFwQ29udGFpbmVyIiwibWFwSW5zdGFuY2UiLCJzaG93U2VhcmNoIiwic2V0U2hvd1NlYXJjaCIsInN0YXJ0TG9jYXRpb24iLCJzZXRTdGFydExvY2F0aW9uIiwiZW5kTG9jYXRpb24iLCJzZXRFbmRMb2NhdGlvbiIsIndheXBvaW50cyIsInNldFdheXBvaW50cyIsInVzZXJMb2NhdGlvbiIsInNldFVzZXJMb2NhdGlvbiIsIm5hdmlnYXRvciIsImdlb2xvY2F0aW9uIiwiZ2V0Q3VycmVudFBvc2l0aW9uIiwicG9zaXRpb24iLCJsYXRpdHVkZSIsImxvbmdpdHVkZSIsImNvb3JkcyIsImN1cnJlbnQiLCJtYXAiLCJjb250YWluZXIiLCJzdHlsZSIsImNlbnRlciIsInpvb20iLCJwaXRjaCIsImJlYXJpbmciLCJNYXJrZXIiLCJjb2xvciIsInNldExuZ0xhdCIsImFkZFRvIiwiYWRkQ29udHJvbCIsIk5hdmlnYXRpb25Db250cm9sIiwiR2VvbG9jYXRlQ29udHJvbCIsInBvc2l0aW9uT3B0aW9ucyIsImVuYWJsZUhpZ2hBY2N1cmFjeSIsInRyYWNrVXNlckxvY2F0aW9uIiwib24iLCJnZXRTb3VyY2UiLCJhZGRTb3VyY2UiLCJ0eXBlIiwiZGF0YSIsInByb3BlcnRpZXMiLCJnZW9tZXRyeSIsImNvb3JkaW5hdGVzIiwiYWRkTGF5ZXIiLCJpZCIsInNvdXJjZSIsImxheW91dCIsInBhaW50IiwicmVtb3ZlIiwiaGFuZGxlTG9jYXRpb25TZWxlY3QiLCJsb2NhdGlvbiIsImZseVRvIiwiZXNzZW50aWFsIiwiZGl2IiwiY2xhc3NOYW1lIiwicmVmIiwiYnV0dG9uIiwib25DbGljayIsIm9uQ2xvc2UiLCJvblN0YXJ0TG9jYXRpb25DaGFuZ2UiLCJvbkVuZExvY2F0aW9uQ2hhbmdlIiwib25XYXlwb2ludEFkZCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/components/Map.tsx\n"));

/***/ })

});