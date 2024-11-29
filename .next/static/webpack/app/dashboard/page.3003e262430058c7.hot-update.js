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

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ Map; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mapbox-gl */ \"(app-pages-browser)/./node_modules/mapbox-gl/dist/mapbox-gl.js\");\n/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(mapbox_gl__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var mapbox_gl_dist_mapbox_gl_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! mapbox-gl/dist/mapbox-gl.css */ \"(app-pages-browser)/./node_modules/mapbox-gl/dist/mapbox-gl.css\");\n/* harmony import */ var _RoutePanel__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./RoutePanel */ \"(app-pages-browser)/./src/components/RoutePanel.tsx\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\n\n\n// Debug token loading\nconst token = \"pk.eyJ1Ijoicm91dG9waWEtYWkiLCJhIjoiY200MWkzb25xMHFtcjJxcHRmOTE3NTlrNSJ9.d2Ds8SJXnQzc2W1o50D76Q\";\nif (!token) {\n    console.error(\"Mapbox token not found\");\n} else {\n    console.log(\"Mapbox token loaded\");\n    (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().accessToken) = token;\n}\nfunction Map() {\n    _s();\n    const mapContainer = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    const map = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    const [showSearch, setShowSearch] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const [startLocation, setStartLocation] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [endLocation, setEndLocation] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    const [waypoints, setWaypoints] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);\n    const [mapError, setMapError] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    // Initialize map\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        console.log(\"Map component mounted\");\n        if (!mapContainer.current || map.current) return;\n        if (!(mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().accessToken)) {\n            setMapError(\"Mapbox token not set\");\n            return;\n        }\n        try {\n            console.log(\"Initializing map...\");\n            map.current = new (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().Map)({\n                container: mapContainer.current,\n                style: \"mapbox://styles/mapbox/dark-v11\",\n                center: [\n                    -105.0178,\n                    39.7392\n                ],\n                zoom: 14,\n                pitch: 45,\n                bearing: 0\n            });\n            map.current.on(\"load\", ()=>{\n                console.log(\"Map loaded successfully\");\n                if (!map.current) return;\n                // Add route layer if it doesn't exist\n                if (!map.current.getSource(\"route\")) {\n                    map.current.addSource(\"route\", {\n                        type: \"geojson\",\n                        data: {\n                            type: \"Feature\",\n                            properties: {},\n                            geometry: {\n                                type: \"LineString\",\n                                coordinates: []\n                            }\n                        }\n                    });\n                    map.current.addLayer({\n                        id: \"route\",\n                        type: \"line\",\n                        source: \"route\",\n                        layout: {\n                            \"line-join\": \"round\",\n                            \"line-cap\": \"round\"\n                        },\n                        paint: {\n                            \"line-color\": \"#34d399\",\n                            \"line-width\": 4\n                        }\n                    });\n                }\n            });\n            map.current.on(\"error\", (e)=>{\n                console.error(\"Mapbox error:\", e);\n                setMapError(\"Error loading map\");\n            });\n        } catch (error) {\n            console.error(\"Error initializing map:\", error);\n            setMapError(\"Error initializing map\");\n        }\n        return ()=>{\n            var _map_current;\n            console.log(\"Cleaning up map\");\n            (_map_current = map.current) === null || _map_current === void 0 ? void 0 : _map_current.remove();\n        };\n    }, []);\n    // Update route when locations change\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        if (!map.current || !startLocation || !endLocation) return;\n    // Update route display logic here\n    // This is where we'll add the route drawing functionality\n    }, [\n        startLocation,\n        endLocation\n    ]);\n    const handleLocationSelect = (location, type)=>{\n        if (!map.current) return;\n        map.current.flyTo({\n            center: location.coordinates,\n            zoom: 14,\n            essential: true\n        });\n        switch(type){\n            case \"start\":\n                setStartLocation(location);\n                break;\n            case \"end\":\n                setEndLocation(location);\n                break;\n            case \"waypoint\":\n                setWaypoints([\n                    ...waypoints,\n                    location\n                ]);\n                break;\n        }\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"relative w-full h-full\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                ref: mapContainer,\n                className: \"absolute inset-0\"\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                lineNumber: 135,\n                columnNumber: 7\n            }, this),\n            mapError && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"absolute inset-0 flex items-center justify-center bg-stone-900/80\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    className: \"text-red-500 bg-stone-800 p-4 rounded-lg\",\n                    children: mapError\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                    lineNumber: 139,\n                    columnNumber: 11\n                }, this)\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                lineNumber: 138,\n                columnNumber: 9\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"absolute top-4 left-4 z-10\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                    onClick: ()=>setShowSearch(true),\n                    className: \"px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-md shadow-lg\",\n                    children: \"Plan Route\"\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                    lineNumber: 146,\n                    columnNumber: 9\n                }, this)\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                lineNumber: 145,\n                columnNumber: 7\n            }, this),\n            showSearch && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_RoutePanel__WEBPACK_IMPORTED_MODULE_4__.RoutePanel, {\n                onClose: ()=>setShowSearch(false),\n                startLocation: startLocation,\n                endLocation: endLocation,\n                waypoints: waypoints,\n                onStartLocationChange: (location)=>handleLocationSelect(location, \"start\"),\n                onEndLocationChange: (location)=>handleLocationSelect(location, \"end\"),\n                onWaypointAdd: (location)=>handleLocationSelect(location, \"waypoint\")\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                lineNumber: 155,\n                columnNumber: 9\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n        lineNumber: 134,\n        columnNumber: 5\n    }, this);\n}\n_s(Map, \"k7InwdWrwA5M1qvehYVKLYBWMgE=\");\n_c = Map;\nvar _c;\n$RefreshReg$(_c, \"Map\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9jb21wb25lbnRzL01hcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUVvRDtBQUNuQjtBQUNLO0FBRUk7QUFFMUMsc0JBQXNCO0FBQ3RCLE1BQU1LLFFBQVFDLGdHQUFvQztBQUNsRCxJQUFJLENBQUNELE9BQU87SUFDVkksUUFBUUMsS0FBSyxDQUFDO0FBQ2hCLE9BQU87SUFDTEQsUUFBUUUsR0FBRyxDQUFDO0lBQ1pSLDhEQUFvQixHQUFHRTtBQUN6QjtBQU9lLFNBQVNROztJQUN0QixNQUFNQyxlQUFlYiw2Q0FBTUEsQ0FBaUI7SUFDNUMsTUFBTWMsTUFBTWQsNkNBQU1BLENBQXNCO0lBQ3hDLE1BQU0sQ0FBQ2UsWUFBWUMsY0FBYyxHQUFHZiwrQ0FBUUEsQ0FBQztJQUM3QyxNQUFNLENBQUNnQixlQUFlQyxpQkFBaUIsR0FBR2pCLCtDQUFRQSxDQUFrQjtJQUNwRSxNQUFNLENBQUNrQixhQUFhQyxlQUFlLEdBQUduQiwrQ0FBUUEsQ0FBa0I7SUFDaEUsTUFBTSxDQUFDb0IsV0FBV0MsYUFBYSxHQUFHckIsK0NBQVFBLENBQWEsRUFBRTtJQUN6RCxNQUFNLENBQUNzQixVQUFVQyxZQUFZLEdBQUd2QiwrQ0FBUUEsQ0FBZ0I7SUFFeEQsaUJBQWlCO0lBQ2pCRixnREFBU0EsQ0FBQztRQUNSUyxRQUFRRSxHQUFHLENBQUM7UUFDWixJQUFJLENBQUNHLGFBQWFZLE9BQU8sSUFBSVgsSUFBSVcsT0FBTyxFQUFFO1FBRTFDLElBQUksQ0FBQ3ZCLDhEQUFvQixFQUFFO1lBQ3pCc0IsWUFBWTtZQUNaO1FBQ0Y7UUFFQSxJQUFJO1lBQ0ZoQixRQUFRRSxHQUFHLENBQUM7WUFDWkksSUFBSVcsT0FBTyxHQUFHLElBQUl2QixzREFBWSxDQUFDO2dCQUM3QndCLFdBQVdiLGFBQWFZLE9BQU87Z0JBQy9CRSxPQUFPO2dCQUNQQyxRQUFRO29CQUFDLENBQUM7b0JBQVU7aUJBQVE7Z0JBQzVCQyxNQUFNO2dCQUNOQyxPQUFPO2dCQUNQQyxTQUFTO1lBQ1g7WUFFQWpCLElBQUlXLE9BQU8sQ0FBQ08sRUFBRSxDQUFDLFFBQVE7Z0JBQ3JCeEIsUUFBUUUsR0FBRyxDQUFDO2dCQUNaLElBQUksQ0FBQ0ksSUFBSVcsT0FBTyxFQUFFO2dCQUVsQixzQ0FBc0M7Z0JBQ3RDLElBQUksQ0FBQ1gsSUFBSVcsT0FBTyxDQUFDUSxTQUFTLENBQUMsVUFBVTtvQkFDbkNuQixJQUFJVyxPQUFPLENBQUNTLFNBQVMsQ0FBQyxTQUFTO3dCQUM3QkMsTUFBTTt3QkFDTkMsTUFBTTs0QkFDSkQsTUFBTTs0QkFDTkUsWUFBWSxDQUFDOzRCQUNiQyxVQUFVO2dDQUNSSCxNQUFNO2dDQUNOSSxhQUFhLEVBQUU7NEJBQ2pCO3dCQUNGO29CQUNGO29CQUVBekIsSUFBSVcsT0FBTyxDQUFDZSxRQUFRLENBQUM7d0JBQ25CQyxJQUFJO3dCQUNKTixNQUFNO3dCQUNOTyxRQUFRO3dCQUNSQyxRQUFROzRCQUNOLGFBQWE7NEJBQ2IsWUFBWTt3QkFDZDt3QkFDQUMsT0FBTzs0QkFDTCxjQUFjOzRCQUNkLGNBQWM7d0JBQ2hCO29CQUNGO2dCQUNGO1lBQ0Y7WUFFQTlCLElBQUlXLE9BQU8sQ0FBQ08sRUFBRSxDQUFDLFNBQVMsQ0FBQ2E7Z0JBQ3ZCckMsUUFBUUMsS0FBSyxDQUFDLGlCQUFpQm9DO2dCQUMvQnJCLFlBQVk7WUFDZDtRQUVGLEVBQUUsT0FBT2YsT0FBTztZQUNkRCxRQUFRQyxLQUFLLENBQUMsMkJBQTJCQTtZQUN6Q2UsWUFBWTtRQUNkO1FBRUEsT0FBTztnQkFFTFY7WUFEQU4sUUFBUUUsR0FBRyxDQUFDO2FBQ1pJLGVBQUFBLElBQUlXLE9BQU8sY0FBWFgsbUNBQUFBLGFBQWFnQyxNQUFNO1FBQ3JCO0lBQ0YsR0FBRyxFQUFFO0lBRUwscUNBQXFDO0lBQ3JDL0MsZ0RBQVNBLENBQUM7UUFDUixJQUFJLENBQUNlLElBQUlXLE9BQU8sSUFBSSxDQUFDUixpQkFBaUIsQ0FBQ0UsYUFBYTtJQUVwRCxrQ0FBa0M7SUFDbEMsMERBQTBEO0lBQzVELEdBQUc7UUFBQ0Y7UUFBZUU7S0FBWTtJQUUvQixNQUFNNEIsdUJBQXVCLENBQUNDLFVBQW9CYjtRQUNoRCxJQUFJLENBQUNyQixJQUFJVyxPQUFPLEVBQUU7UUFFbEJYLElBQUlXLE9BQU8sQ0FBQ3dCLEtBQUssQ0FBQztZQUNoQnJCLFFBQVFvQixTQUFTVCxXQUFXO1lBQzVCVixNQUFNO1lBQ05xQixXQUFXO1FBQ2I7UUFFQSxPQUFRZjtZQUNOLEtBQUs7Z0JBQ0hqQixpQkFBaUI4QjtnQkFDakI7WUFDRixLQUFLO2dCQUNINUIsZUFBZTRCO2dCQUNmO1lBQ0YsS0FBSztnQkFDSDFCLGFBQWE7dUJBQUlEO29CQUFXMkI7aUJBQVM7Z0JBQ3JDO1FBQ0o7SUFDRjtJQUVBLHFCQUNFLDhEQUFDRztRQUFJQyxXQUFVOzswQkFDYiw4REFBQ0Q7Z0JBQUlFLEtBQUt4QztnQkFBY3VDLFdBQVU7Ozs7OztZQUVqQzdCLDBCQUNDLDhEQUFDNEI7Z0JBQUlDLFdBQVU7MEJBQ2IsNEVBQUNEO29CQUFJQyxXQUFVOzhCQUNaN0I7Ozs7Ozs7Ozs7OzBCQUtQLDhEQUFDNEI7Z0JBQUlDLFdBQVU7MEJBQ2IsNEVBQUNFO29CQUNDQyxTQUFTLElBQU12QyxjQUFjO29CQUM3Qm9DLFdBQVU7OEJBQ1g7Ozs7Ozs7Ozs7O1lBS0ZyQyw0QkFDQyw4REFBQ1osbURBQVVBO2dCQUNUcUQsU0FBUyxJQUFNeEMsY0FBYztnQkFDN0JDLGVBQWVBO2dCQUNmRSxhQUFhQTtnQkFDYkUsV0FBV0E7Z0JBQ1hvQyx1QkFBdUIsQ0FBQ1QsV0FBYUQscUJBQXFCQyxVQUFVO2dCQUNwRVUscUJBQXFCLENBQUNWLFdBQWFELHFCQUFxQkMsVUFBVTtnQkFDbEVXLGVBQWUsQ0FBQ1gsV0FBYUQscUJBQXFCQyxVQUFVOzs7Ozs7Ozs7Ozs7QUFLdEU7R0FoSndCcEM7S0FBQUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vc3JjL2NvbXBvbmVudHMvTWFwLnRzeD9iMTY1Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50JztcclxuXHJcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IG1hcGJveGdsIGZyb20gJ21hcGJveC1nbCc7XHJcbmltcG9ydCAnbWFwYm94LWdsL2Rpc3QvbWFwYm94LWdsLmNzcyc7XHJcbmltcG9ydCB7IFNlYXJjaEJveCB9IGZyb20gJy4vU2VhcmNoQm94JztcclxuaW1wb3J0IHsgUm91dGVQYW5lbCB9IGZyb20gJy4vUm91dGVQYW5lbCc7XHJcblxyXG4vLyBEZWJ1ZyB0b2tlbiBsb2FkaW5nXHJcbmNvbnN0IHRva2VuID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfTUFQQk9YX1RPS0VOO1xyXG5pZiAoIXRva2VuKSB7XHJcbiAgY29uc29sZS5lcnJvcignTWFwYm94IHRva2VuIG5vdCBmb3VuZCcpO1xyXG59IGVsc2Uge1xyXG4gIGNvbnNvbGUubG9nKCdNYXBib3ggdG9rZW4gbG9hZGVkJyk7XHJcbiAgbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSB0b2tlbjtcclxufVxyXG5cclxuaW50ZXJmYWNlIExvY2F0aW9uIHtcclxuICBjb29yZGluYXRlczogW251bWJlciwgbnVtYmVyXTtcclxuICBhZGRyZXNzOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIE1hcCgpIHtcclxuICBjb25zdCBtYXBDb250YWluZXIgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpO1xyXG4gIGNvbnN0IG1hcCA9IHVzZVJlZjxtYXBib3hnbC5NYXAgfCBudWxsPihudWxsKTtcclxuICBjb25zdCBbc2hvd1NlYXJjaCwgc2V0U2hvd1NlYXJjaF0gPSB1c2VTdGF0ZShmYWxzZSk7XHJcbiAgY29uc3QgW3N0YXJ0TG9jYXRpb24sIHNldFN0YXJ0TG9jYXRpb25dID0gdXNlU3RhdGU8TG9jYXRpb24gfCBudWxsPihudWxsKTtcclxuICBjb25zdCBbZW5kTG9jYXRpb24sIHNldEVuZExvY2F0aW9uXSA9IHVzZVN0YXRlPExvY2F0aW9uIHwgbnVsbD4obnVsbCk7XHJcbiAgY29uc3QgW3dheXBvaW50cywgc2V0V2F5cG9pbnRzXSA9IHVzZVN0YXRlPExvY2F0aW9uW10+KFtdKTtcclxuICBjb25zdCBbbWFwRXJyb3IsIHNldE1hcEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xyXG5cclxuICAvLyBJbml0aWFsaXplIG1hcFxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnTWFwIGNvbXBvbmVudCBtb3VudGVkJyk7XHJcbiAgICBpZiAoIW1hcENvbnRhaW5lci5jdXJyZW50IHx8IG1hcC5jdXJyZW50KSByZXR1cm47XHJcbiAgICBcclxuICAgIGlmICghbWFwYm94Z2wuYWNjZXNzVG9rZW4pIHtcclxuICAgICAgc2V0TWFwRXJyb3IoJ01hcGJveCB0b2tlbiBub3Qgc2V0Jyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIG1hcC4uLicpO1xyXG4gICAgICBtYXAuY3VycmVudCA9IG5ldyBtYXBib3hnbC5NYXAoe1xyXG4gICAgICAgIGNvbnRhaW5lcjogbWFwQ29udGFpbmVyLmN1cnJlbnQsXHJcbiAgICAgICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2RhcmstdjExJyxcclxuICAgICAgICBjZW50ZXI6IFstMTA1LjAxNzgsIDM5LjczOTJdLFxyXG4gICAgICAgIHpvb206IDE0LFxyXG4gICAgICAgIHBpdGNoOiA0NSxcclxuICAgICAgICBiZWFyaW5nOiAwXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgbWFwLmN1cnJlbnQub24oJ2xvYWQnLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ01hcCBsb2FkZWQgc3VjY2Vzc2Z1bGx5Jyk7XHJcbiAgICAgICAgaWYgKCFtYXAuY3VycmVudCkgcmV0dXJuO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEFkZCByb3V0ZSBsYXllciBpZiBpdCBkb2Vzbid0IGV4aXN0XHJcbiAgICAgICAgaWYgKCFtYXAuY3VycmVudC5nZXRTb3VyY2UoJ3JvdXRlJykpIHtcclxuICAgICAgICAgIG1hcC5jdXJyZW50LmFkZFNvdXJjZSgncm91dGUnLCB7XHJcbiAgICAgICAgICAgIHR5cGU6ICdnZW9qc29uJyxcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgIHR5cGU6ICdGZWF0dXJlJyxcclxuICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fSxcclxuICAgICAgICAgICAgICBnZW9tZXRyeToge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ0xpbmVTdHJpbmcnLFxyXG4gICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IFtdXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBtYXAuY3VycmVudC5hZGRMYXllcih7XHJcbiAgICAgICAgICAgIGlkOiAncm91dGUnLFxyXG4gICAgICAgICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgICAgICAgIHNvdXJjZTogJ3JvdXRlJyxcclxuICAgICAgICAgICAgbGF5b3V0OiB7XHJcbiAgICAgICAgICAgICAgJ2xpbmUtam9pbic6ICdyb3VuZCcsXHJcbiAgICAgICAgICAgICAgJ2xpbmUtY2FwJzogJ3JvdW5kJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwYWludDoge1xyXG4gICAgICAgICAgICAgICdsaW5lLWNvbG9yJzogJyMzNGQzOTknLFxyXG4gICAgICAgICAgICAgICdsaW5lLXdpZHRoJzogNFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgbWFwLmN1cnJlbnQub24oJ2Vycm9yJywgKGUpID0+IHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdNYXBib3ggZXJyb3I6JywgZSk7XHJcbiAgICAgICAgc2V0TWFwRXJyb3IoJ0Vycm9yIGxvYWRpbmcgbWFwJyk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluaXRpYWxpemluZyBtYXA6JywgZXJyb3IpO1xyXG4gICAgICBzZXRNYXBFcnJvcignRXJyb3IgaW5pdGlhbGl6aW5nIG1hcCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCdDbGVhbmluZyB1cCBtYXAnKTtcclxuICAgICAgbWFwLmN1cnJlbnQ/LnJlbW92ZSgpO1xyXG4gICAgfTtcclxuICB9LCBbXSk7XHJcblxyXG4gIC8vIFVwZGF0ZSByb3V0ZSB3aGVuIGxvY2F0aW9ucyBjaGFuZ2VcclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKCFtYXAuY3VycmVudCB8fCAhc3RhcnRMb2NhdGlvbiB8fCAhZW5kTG9jYXRpb24pIHJldHVybjtcclxuXHJcbiAgICAvLyBVcGRhdGUgcm91dGUgZGlzcGxheSBsb2dpYyBoZXJlXHJcbiAgICAvLyBUaGlzIGlzIHdoZXJlIHdlJ2xsIGFkZCB0aGUgcm91dGUgZHJhd2luZyBmdW5jdGlvbmFsaXR5XHJcbiAgfSwgW3N0YXJ0TG9jYXRpb24sIGVuZExvY2F0aW9uXSk7XHJcblxyXG4gIGNvbnN0IGhhbmRsZUxvY2F0aW9uU2VsZWN0ID0gKGxvY2F0aW9uOiBMb2NhdGlvbiwgdHlwZTogJ3N0YXJ0JyB8ICdlbmQnIHwgJ3dheXBvaW50JykgPT4ge1xyXG4gICAgaWYgKCFtYXAuY3VycmVudCkgcmV0dXJuO1xyXG5cclxuICAgIG1hcC5jdXJyZW50LmZseVRvKHtcclxuICAgICAgY2VudGVyOiBsb2NhdGlvbi5jb29yZGluYXRlcyxcclxuICAgICAgem9vbTogMTQsXHJcbiAgICAgIGVzc2VudGlhbDogdHJ1ZVxyXG4gICAgfSk7XHJcblxyXG4gICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgIGNhc2UgJ3N0YXJ0JzpcclxuICAgICAgICBzZXRTdGFydExvY2F0aW9uKGxvY2F0aW9uKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnZW5kJzpcclxuICAgICAgICBzZXRFbmRMb2NhdGlvbihsb2NhdGlvbik7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ3dheXBvaW50JzpcclxuICAgICAgICBzZXRXYXlwb2ludHMoWy4uLndheXBvaW50cywgbG9jYXRpb25dKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSB3LWZ1bGwgaC1mdWxsXCI+XHJcbiAgICAgIDxkaXYgcmVmPXttYXBDb250YWluZXJ9IGNsYXNzTmFtZT1cImFic29sdXRlIGluc2V0LTBcIiAvPlxyXG4gICAgICBcclxuICAgICAge21hcEVycm9yICYmIChcclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIGluc2V0LTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgYmctc3RvbmUtOTAwLzgwXCI+XHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtcmVkLTUwMCBiZy1zdG9uZS04MDAgcC00IHJvdW5kZWQtbGdcIj5cclxuICAgICAgICAgICAge21hcEVycm9yfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcbiAgICAgIFxyXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC00IGxlZnQtNCB6LTEwXCI+XHJcbiAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2hvd1NlYXJjaCh0cnVlKX1cclxuICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTQgcHktMiBiZy1zdG9uZS04MDAgaG92ZXI6Ymctc3RvbmUtNzAwIHRleHQtd2hpdGUgcm91bmRlZC1tZCBzaGFkb3ctbGdcIlxyXG4gICAgICAgID5cclxuICAgICAgICAgIFBsYW4gUm91dGVcclxuICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICB7c2hvd1NlYXJjaCAmJiAoXHJcbiAgICAgICAgPFJvdXRlUGFuZWxcclxuICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHNldFNob3dTZWFyY2goZmFsc2UpfVxyXG4gICAgICAgICAgc3RhcnRMb2NhdGlvbj17c3RhcnRMb2NhdGlvbn1cclxuICAgICAgICAgIGVuZExvY2F0aW9uPXtlbmRMb2NhdGlvbn1cclxuICAgICAgICAgIHdheXBvaW50cz17d2F5cG9pbnRzfVxyXG4gICAgICAgICAgb25TdGFydExvY2F0aW9uQ2hhbmdlPXsobG9jYXRpb24pID0+IGhhbmRsZUxvY2F0aW9uU2VsZWN0KGxvY2F0aW9uLCAnc3RhcnQnKX1cclxuICAgICAgICAgIG9uRW5kTG9jYXRpb25DaGFuZ2U9eyhsb2NhdGlvbikgPT4gaGFuZGxlTG9jYXRpb25TZWxlY3QobG9jYXRpb24sICdlbmQnKX1cclxuICAgICAgICAgIG9uV2F5cG9pbnRBZGQ9eyhsb2NhdGlvbikgPT4gaGFuZGxlTG9jYXRpb25TZWxlY3QobG9jYXRpb24sICd3YXlwb2ludCcpfVxyXG4gICAgICAgIC8+XHJcbiAgICAgICl9XHJcbiAgICA8L2Rpdj5cclxuICApO1xyXG59XHJcbiJdLCJuYW1lcyI6WyJ1c2VFZmZlY3QiLCJ1c2VSZWYiLCJ1c2VTdGF0ZSIsIm1hcGJveGdsIiwiUm91dGVQYW5lbCIsInRva2VuIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX01BUEJPWF9UT0tFTiIsImNvbnNvbGUiLCJlcnJvciIsImxvZyIsImFjY2Vzc1Rva2VuIiwiTWFwIiwibWFwQ29udGFpbmVyIiwibWFwIiwic2hvd1NlYXJjaCIsInNldFNob3dTZWFyY2giLCJzdGFydExvY2F0aW9uIiwic2V0U3RhcnRMb2NhdGlvbiIsImVuZExvY2F0aW9uIiwic2V0RW5kTG9jYXRpb24iLCJ3YXlwb2ludHMiLCJzZXRXYXlwb2ludHMiLCJtYXBFcnJvciIsInNldE1hcEVycm9yIiwiY3VycmVudCIsImNvbnRhaW5lciIsInN0eWxlIiwiY2VudGVyIiwiem9vbSIsInBpdGNoIiwiYmVhcmluZyIsIm9uIiwiZ2V0U291cmNlIiwiYWRkU291cmNlIiwidHlwZSIsImRhdGEiLCJwcm9wZXJ0aWVzIiwiZ2VvbWV0cnkiLCJjb29yZGluYXRlcyIsImFkZExheWVyIiwiaWQiLCJzb3VyY2UiLCJsYXlvdXQiLCJwYWludCIsImUiLCJyZW1vdmUiLCJoYW5kbGVMb2NhdGlvblNlbGVjdCIsImxvY2F0aW9uIiwiZmx5VG8iLCJlc3NlbnRpYWwiLCJkaXYiLCJjbGFzc05hbWUiLCJyZWYiLCJidXR0b24iLCJvbkNsaWNrIiwib25DbG9zZSIsIm9uU3RhcnRMb2NhdGlvbkNoYW5nZSIsIm9uRW5kTG9jYXRpb25DaGFuZ2UiLCJvbldheXBvaW50QWRkIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/components/Map.tsx\n"));

/***/ })

});