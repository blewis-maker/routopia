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

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": function() { return /* binding */ Map; }\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mapbox-gl */ \"(app-pages-browser)/./node_modules/mapbox-gl/dist/mapbox-gl.js\");\n/* harmony import */ var mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(mapbox_gl__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var mapbox_gl_dist_mapbox_gl_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! mapbox-gl/dist/mapbox-gl.css */ \"(app-pages-browser)/./node_modules/mapbox-gl/dist/mapbox-gl.css\");\n/* harmony import */ var _SearchPanel__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./SearchPanel */ \"(app-pages-browser)/./src/components/SearchPanel.tsx\");\n/* harmony import */ var _lib_pointsOfInterest__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/lib/pointsOfInterest */ \"(app-pages-browser)/./src/lib/pointsOfInterest.ts\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\n\n\n\n(mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().accessToken) = \"pk.eyJ1Ijoicm91dG9waWEtYWkiLCJhIjoiY200MWkzb25xMHFtcjJxcHRmOTE3NTlrNSJ9.d2Ds8SJXnQzc2W1o50D76Q\";\nfunction Map() {\n    _s();\n    const mapContainer = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    const mapInstance = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    const locationMarker = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    const routeSource = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);\n    const [showSearch, setShowSearch] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    const [userLocation, setUserLocation] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null);\n    // Create route between two points\n    const createRoute = async (start, end)=>{\n        try {\n            var _mapInstance_current, _mapInstance_current1;\n            // Get route from Mapbox Directions API\n            const query = await fetch(\"https://api.mapbox.com/directions/v5/mapbox/walking/\".concat(start[0], \",\").concat(start[1], \";\").concat(end[0], \",\").concat(end[1], \"?steps=true&geometries=geojson&access_token=\").concat((mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().accessToken)));\n            const json = await query.json();\n            const data = json.routes[0];\n            const route = data.geometry.coordinates;\n            // Add the route to the map\n            if (!((_mapInstance_current = mapInstance.current) === null || _mapInstance_current === void 0 ? void 0 : _mapInstance_current.getSource(\"route\"))) {\n                var _mapInstance_current2, _mapInstance_current3;\n                (_mapInstance_current2 = mapInstance.current) === null || _mapInstance_current2 === void 0 ? void 0 : _mapInstance_current2.addSource(\"route\", {\n                    type: \"geojson\",\n                    data: {\n                        type: \"Feature\",\n                        properties: {},\n                        geometry: {\n                            type: \"LineString\",\n                            coordinates: route\n                        }\n                    }\n                });\n                (_mapInstance_current3 = mapInstance.current) === null || _mapInstance_current3 === void 0 ? void 0 : _mapInstance_current3.addLayer({\n                    id: \"route\",\n                    type: \"line\",\n                    source: \"route\",\n                    layout: {\n                        \"line-join\": \"round\",\n                        \"line-cap\": \"round\"\n                    },\n                    paint: {\n                        \"line-color\": \"#10b981\",\n                        \"line-width\": 4,\n                        \"line-opacity\": 0.75,\n                        \"line-dasharray\": [\n                            0,\n                            4\n                        ]\n                    }\n                });\n                // Animate the line\n                let step = 0;\n                const animationSpeed = 50;\n                const dashArraySequence = [\n                    [\n                        0,\n                        4\n                    ],\n                    [\n                        0.5,\n                        3.5\n                    ],\n                    [\n                        1,\n                        3\n                    ],\n                    [\n                        1.5,\n                        2.5\n                    ],\n                    [\n                        2,\n                        2\n                    ],\n                    [\n                        2.5,\n                        1.5\n                    ],\n                    [\n                        3,\n                        1\n                    ],\n                    [\n                        3.5,\n                        0.5\n                    ],\n                    [\n                        4,\n                        0\n                    ]\n                ];\n                function animateLine() {\n                    if (step < dashArraySequence.length - 1) {\n                        var _mapInstance_current;\n                        step += 1;\n                        (_mapInstance_current = mapInstance.current) === null || _mapInstance_current === void 0 ? void 0 : _mapInstance_current.setPaintProperty(\"route\", \"line-dasharray\", dashArraySequence[step]);\n                        requestAnimationFrame(animateLine);\n                    } else {\n                        // After line is drawn, add POIs with animation\n                        setTimeout(()=>addPOIsToMap(pois), 300);\n                    }\n                }\n                requestAnimationFrame(animateLine);\n            } else {\n                var _mapInstance_current4;\n                // Update existing route\n                const routeSource = (_mapInstance_current4 = mapInstance.current) === null || _mapInstance_current4 === void 0 ? void 0 : _mapInstance_current4.getSource(\"route\");\n                routeSource.setData({\n                    type: \"Feature\",\n                    properties: {},\n                    geometry: {\n                        type: \"LineString\",\n                        coordinates: route\n                    }\n                });\n            }\n            // Find and add POIs along route\n            const pois = await (0,_lib_pointsOfInterest__WEBPACK_IMPORTED_MODULE_5__.findPOIsAlongRoute)(route);\n            addPOIsToMap(pois);\n            // Fit map to show entire route\n            const coordinates = route;\n            const bounds = coordinates.reduce((bounds, coord)=>{\n                return bounds.extend(coord);\n            }, new (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().LngLatBounds)(coordinates[0], coordinates[0]));\n            (_mapInstance_current1 = mapInstance.current) === null || _mapInstance_current1 === void 0 ? void 0 : _mapInstance_current1.fitBounds(bounds, {\n                padding: 50\n            });\n        } catch (error) {\n            console.error(\"Error creating route:\", error);\n        }\n    };\n    // Handle location selection from search\n    const handleLocationSelect = (coordinates)=>{\n        if (!userLocation) return;\n        createRoute(userLocation, coordinates);\n        setShowSearch(false);\n    };\n    // Add POI markers to map\n    const addPOIsToMap = (pois)=>{\n        // Remove existing POI markers first\n        const existingMarkers = document.querySelectorAll(\".poi-marker\");\n        existingMarkers.forEach((marker)=>marker.remove());\n        pois.forEach((poi)=>{\n            const el = document.createElement(\"div\");\n            el.className = \"poi-marker poi-\".concat(poi.type);\n            const popup = new (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().Popup)({\n                offset: 25,\n                closeButton: true,\n                closeOnClick: false\n            }).setHTML('\\n        <div style=\"background: #1c1917; color: #ffffff; padding: 12px;\">\\n          <h3 style=\"color: #10b981; margin: 0 0 4px 0; font-size: 14px;\">'.concat(poi.name, '</h3>\\n          <p style=\"color: #a8a29e; margin: 0; font-size: 12px;\">').concat(poi.description || \"\", \"</p>\\n        </div>\\n      \"));\n            new (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().Marker)({\n                element: el,\n                anchor: \"bottom\"\n            }).setLngLat(poi.coordinates).setPopup(popup).addTo(mapInstance.current);\n        });\n    };\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        if (!mapContainer.current) return;\n        // Initialize map\n        mapInstance.current = new (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().Map)({\n            container: mapContainer.current,\n            style: \"mapbox://styles/mapbox/dark-v11\",\n            center: [\n                -105.2705,\n                40.0150\n            ],\n            zoom: 14\n        });\n        // Get user location\n        if (\"geolocation\" in navigator) {\n            navigator.geolocation.getCurrentPosition((position)=>{\n                var // Center map on location\n                _mapInstance_current;\n                const location = [\n                    position.coords.longitude,\n                    position.coords.latitude\n                ];\n                setUserLocation(location);\n                // Create custom HTML element for marker\n                const el = document.createElement(\"div\");\n                el.className = \"custom-marker\";\n                const dot = document.createElement(\"div\");\n                dot.className = \"marker-dot\";\n                el.appendChild(dot);\n                const pulse = document.createElement(\"div\");\n                pulse.className = \"marker-pulse\";\n                el.appendChild(pulse);\n                // Create new marker with custom element\n                locationMarker.current = new (mapbox_gl__WEBPACK_IMPORTED_MODULE_2___default().Marker)({\n                    element: el,\n                    anchor: \"center\"\n                }).setLngLat(location).addTo(mapInstance.current);\n                (_mapInstance_current = mapInstance.current) === null || _mapInstance_current === void 0 ? void 0 : _mapInstance_current.flyTo({\n                    center: location,\n                    zoom: 15,\n                    essential: true\n                });\n            }, (error)=>console.error(\"Error getting location:\", error), {\n                enableHighAccuracy: true,\n                timeout: 5000,\n                maximumAge: 0\n            });\n        }\n        return ()=>{\n            if (locationMarker.current) {\n                locationMarker.current.remove();\n            }\n            if (mapInstance.current) {\n                mapInstance.current.remove();\n            }\n        };\n    }, []);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"relative w-full h-full\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                ref: mapContainer,\n                className: \"absolute inset-0\"\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                lineNumber: 231,\n                columnNumber: 7\n            }, this),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                onClick: ()=>setShowSearch(true),\n                className: \"absolute top-4 left-4 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-md shadow-lg\",\n                children: \"Set Destination\"\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                lineNumber: 234,\n                columnNumber: 7\n            }, this),\n            showSearch && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_SearchPanel__WEBPACK_IMPORTED_MODULE_4__.SearchPanel, {\n                onClose: ()=>setShowSearch(false),\n                onLocationSelect: handleLocationSelect\n            }, void 0, false, {\n                fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n                lineNumber: 243,\n                columnNumber: 9\n            }, this)\n        ]\n    }, void 0, true, {\n        fileName: \"C:\\\\Users\\\\blewi\\\\Routopia\\\\src\\\\components\\\\Map.tsx\",\n        lineNumber: 230,\n        columnNumber: 5\n    }, this);\n}\n_s(Map, \"a9zEwjw+TkuRbQ38evpao2rqgmE=\");\n_c = Map;\nvar _c;\n$RefreshReg$(_c, \"Map\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9jb21wb25lbnRzL01hcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFFb0Q7QUFDbkI7QUFDSztBQUNNO0FBQ2dCO0FBRTVERyw4REFBb0IsR0FBR0ksZ0dBQW9DO0FBRTVDLFNBQVNHOztJQUN0QixNQUFNQyxlQUFlViw2Q0FBTUEsQ0FBaUI7SUFDNUMsTUFBTVcsY0FBY1gsNkNBQU1BLENBQXNCO0lBQ2hELE1BQU1ZLGlCQUFpQlosNkNBQU1BLENBQXlCO0lBQ3RELE1BQU1hLGNBQWNiLDZDQUFNQSxDQUFnQztJQUMxRCxNQUFNLENBQUNjLFlBQVlDLGNBQWMsR0FBR2QsK0NBQVFBLENBQUM7SUFDN0MsTUFBTSxDQUFDZSxjQUFjQyxnQkFBZ0IsR0FBR2hCLCtDQUFRQSxDQUEwQjtJQUUxRSxrQ0FBa0M7SUFDbEMsTUFBTWlCLGNBQWMsT0FBT0MsT0FBeUJDO1FBQ2xELElBQUk7Z0JBVUdULHNCQW1GTEE7WUE1RkEsdUNBQXVDO1lBQ3ZDLE1BQU1VLFFBQVEsTUFBTUMsTUFDbEIsdURBQW1FSCxPQUFaQSxLQUFLLENBQUMsRUFBRSxFQUFDLEtBQWVDLE9BQVpELEtBQUssQ0FBQyxFQUFFLEVBQUMsS0FBYUMsT0FBVkEsR0FBRyxDQUFDLEVBQUUsRUFBQyxLQUF3RGxCLE9BQXJEa0IsR0FBRyxDQUFDLEVBQUUsRUFBQyxnREFBbUUsT0FBckJsQiw4REFBb0I7WUFFcEssTUFBTXFCLE9BQU8sTUFBTUYsTUFBTUUsSUFBSTtZQUM3QixNQUFNQyxPQUFPRCxLQUFLRSxNQUFNLENBQUMsRUFBRTtZQUMzQixNQUFNQyxRQUFRRixLQUFLRyxRQUFRLENBQUNDLFdBQVc7WUFFdkMsMkJBQTJCO1lBQzNCLElBQUksR0FBQ2pCLHVCQUFBQSxZQUFZa0IsT0FBTyxjQUFuQmxCLDJDQUFBQSxxQkFBcUJtQixTQUFTLENBQUMsV0FBVTtvQkFDNUNuQix1QkFZQUE7aUJBWkFBLHdCQUFBQSxZQUFZa0IsT0FBTyxjQUFu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LCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vc3JjL2NvbXBvbmVudHMvTWFwLnRzeD9iMTY1Il0sInNvdXJjZXNDb250ZW50IjpbIid1c2UgY2xpZW50JztcclxuXHJcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IG1hcGJveGdsIGZyb20gJ21hcGJveC1nbCc7XHJcbmltcG9ydCAnbWFwYm94LWdsL2Rpc3QvbWFwYm94LWdsLmNzcyc7XHJcbmltcG9ydCB7IFNlYXJjaFBhbmVsIH0gZnJvbSAnLi9TZWFyY2hQYW5lbCc7XHJcbmltcG9ydCB7IGZpbmRQT0lzQWxvbmdSb3V0ZSB9IGZyb20gJ0AvbGliL3BvaW50c09mSW50ZXJlc3QnO1xyXG5cclxubWFwYm94Z2wuYWNjZXNzVG9rZW4gPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19NQVBCT1hfVE9LRU4gYXMgc3RyaW5nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTWFwKCkge1xyXG4gIGNvbnN0IG1hcENvbnRhaW5lciA9IHVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbCk7XHJcbiAgY29uc3QgbWFwSW5zdGFuY2UgPSB1c2VSZWY8bWFwYm94Z2wuTWFwIHwgbnVsbD4obnVsbCk7XHJcbiAgY29uc3QgbG9jYXRpb25NYXJrZXIgPSB1c2VSZWY8bWFwYm94Z2wuTWFya2VyIHwgbnVsbD4obnVsbCk7XHJcbiAgY29uc3Qgcm91dGVTb3VyY2UgPSB1c2VSZWY8bWFwYm94Z2wuR2VvSlNPTlNvdXJjZSB8IG51bGw+KG51bGwpO1xyXG4gIGNvbnN0IFtzaG93U2VhcmNoLCBzZXRTaG93U2VhcmNoXSA9IHVzZVN0YXRlKGZhbHNlKTtcclxuICBjb25zdCBbdXNlckxvY2F0aW9uLCBzZXRVc2VyTG9jYXRpb25dID0gdXNlU3RhdGU8W251bWJlciwgbnVtYmVyXSB8IG51bGw+KG51bGwpO1xyXG5cclxuICAvLyBDcmVhdGUgcm91dGUgYmV0d2VlbiB0d28gcG9pbnRzXHJcbiAgY29uc3QgY3JlYXRlUm91dGUgPSBhc3luYyAoc3RhcnQ6IFtudW1iZXIsIG51bWJlcl0sIGVuZDogW251bWJlciwgbnVtYmVyXSkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gR2V0IHJvdXRlIGZyb20gTWFwYm94IERpcmVjdGlvbnMgQVBJXHJcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gYXdhaXQgZmV0Y2goXHJcbiAgICAgICAgYGh0dHBzOi8vYXBpLm1hcGJveC5jb20vZGlyZWN0aW9ucy92NS9tYXBib3gvd2Fsa2luZy8ke3N0YXJ0WzBdfSwke3N0YXJ0WzFdfTske2VuZFswXX0sJHtlbmRbMV19P3N0ZXBzPXRydWUmZ2VvbWV0cmllcz1nZW9qc29uJmFjY2Vzc190b2tlbj0ke21hcGJveGdsLmFjY2Vzc1Rva2VufWBcclxuICAgICAgKTtcclxuICAgICAgY29uc3QganNvbiA9IGF3YWl0IHF1ZXJ5Lmpzb24oKTtcclxuICAgICAgY29uc3QgZGF0YSA9IGpzb24ucm91dGVzWzBdO1xyXG4gICAgICBjb25zdCByb3V0ZSA9IGRhdGEuZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIHJvdXRlIHRvIHRoZSBtYXBcclxuICAgICAgaWYgKCFtYXBJbnN0YW5jZS5jdXJyZW50Py5nZXRTb3VyY2UoJ3JvdXRlJykpIHtcclxuICAgICAgICBtYXBJbnN0YW5jZS5jdXJyZW50Py5hZGRTb3VyY2UoJ3JvdXRlJywge1xyXG4gICAgICAgICAgdHlwZTogJ2dlb2pzb24nLFxyXG4gICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHt9LFxyXG4gICAgICAgICAgICBnZW9tZXRyeToge1xyXG4gICAgICAgICAgICAgIHR5cGU6ICdMaW5lU3RyaW5nJyxcclxuICAgICAgICAgICAgICBjb29yZGluYXRlczogcm91dGVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBtYXBJbnN0YW5jZS5jdXJyZW50Py5hZGRMYXllcih7XHJcbiAgICAgICAgICBpZDogJ3JvdXRlJyxcclxuICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgIHNvdXJjZTogJ3JvdXRlJyxcclxuICAgICAgICAgIGxheW91dDoge1xyXG4gICAgICAgICAgICAnbGluZS1qb2luJzogJ3JvdW5kJyxcclxuICAgICAgICAgICAgJ2xpbmUtY2FwJzogJ3JvdW5kJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHBhaW50OiB7XHJcbiAgICAgICAgICAgICdsaW5lLWNvbG9yJzogJyMxMGI5ODEnLFxyXG4gICAgICAgICAgICAnbGluZS13aWR0aCc6IDQsXHJcbiAgICAgICAgICAgICdsaW5lLW9wYWNpdHknOiAwLjc1LFxyXG4gICAgICAgICAgICAnbGluZS1kYXNoYXJyYXknOiBbMCwgNF0sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEFuaW1hdGUgdGhlIGxpbmVcclxuICAgICAgICBsZXQgc3RlcCA9IDA7XHJcbiAgICAgICAgY29uc3QgYW5pbWF0aW9uU3BlZWQgPSA1MDtcclxuICAgICAgICBjb25zdCBkYXNoQXJyYXlTZXF1ZW5jZSA9IFtcclxuICAgICAgICAgIFswLCA0XSxcclxuICAgICAgICAgIFswLjUsIDMuNV0sXHJcbiAgICAgICAgICBbMSwgM10sXHJcbiAgICAgICAgICBbMS41LCAyLjVdLFxyXG4gICAgICAgICAgWzIsIDJdLFxyXG4gICAgICAgICAgWzIuNSwgMS41XSxcclxuICAgICAgICAgIFszLCAxXSxcclxuICAgICAgICAgIFszLjUsIDAuNV0sXHJcbiAgICAgICAgICBbNCwgMF1cclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBhbmltYXRlTGluZSgpIHtcclxuICAgICAgICAgIGlmIChzdGVwIDwgZGFzaEFycmF5U2VxdWVuY2UubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICBzdGVwICs9IDE7XHJcbiAgICAgICAgICAgIG1hcEluc3RhbmNlLmN1cnJlbnQ/LnNldFBhaW50UHJvcGVydHkoXHJcbiAgICAgICAgICAgICAgJ3JvdXRlJyxcclxuICAgICAgICAgICAgICAnbGluZS1kYXNoYXJyYXknLFxyXG4gICAgICAgICAgICAgIGRhc2hBcnJheVNlcXVlbmNlW3N0ZXBdXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlTGluZSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBBZnRlciBsaW5lIGlzIGRyYXduLCBhZGQgUE9JcyB3aXRoIGFuaW1hdGlvblxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGFkZFBPSXNUb01hcChwb2lzKSwgMzAwKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlTGluZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gVXBkYXRlIGV4aXN0aW5nIHJvdXRlXHJcbiAgICAgICAgY29uc3Qgcm91dGVTb3VyY2UgPSBtYXBJbnN0YW5jZS5jdXJyZW50Py5nZXRTb3VyY2UoJ3JvdXRlJykgYXMgbWFwYm94Z2wuR2VvSlNPTlNvdXJjZTtcclxuICAgICAgICByb3V0ZVNvdXJjZS5zZXREYXRhKHtcclxuICAgICAgICAgIHR5cGU6ICdGZWF0dXJlJyxcclxuICAgICAgICAgIHByb3BlcnRpZXM6IHt9LFxyXG4gICAgICAgICAgZ2VvbWV0cnk6IHtcclxuICAgICAgICAgICAgdHlwZTogJ0xpbmVTdHJpbmcnLFxyXG4gICAgICAgICAgICBjb29yZGluYXRlczogcm91dGVcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRmluZCBhbmQgYWRkIFBPSXMgYWxvbmcgcm91dGVcclxuICAgICAgY29uc3QgcG9pcyA9IGF3YWl0IGZpbmRQT0lzQWxvbmdSb3V0ZShyb3V0ZSk7XHJcbiAgICAgIGFkZFBPSXNUb01hcChwb2lzKTtcclxuXHJcbiAgICAgIC8vIEZpdCBtYXAgdG8gc2hvdyBlbnRpcmUgcm91dGVcclxuICAgICAgY29uc3QgY29vcmRpbmF0ZXMgPSByb3V0ZTtcclxuICAgICAgY29uc3QgYm91bmRzID0gY29vcmRpbmF0ZXMucmVkdWNlKChib3VuZHMsIGNvb3JkKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGJvdW5kcy5leHRlbmQoY29vcmQgYXMgbWFwYm94Z2wuTG5nTGF0TGlrZSk7XHJcbiAgICAgIH0sIG5ldyBtYXBib3hnbC5MbmdMYXRCb3VuZHMoY29vcmRpbmF0ZXNbMF0sIGNvb3JkaW5hdGVzWzBdKSk7XHJcblxyXG4gICAgICBtYXBJbnN0YW5jZS5jdXJyZW50Py5maXRCb3VuZHMoYm91bmRzLCB7XHJcbiAgICAgICAgcGFkZGluZzogNTBcclxuICAgICAgfSk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyByb3V0ZTonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLy8gSGFuZGxlIGxvY2F0aW9uIHNlbGVjdGlvbiBmcm9tIHNlYXJjaFxyXG4gIGNvbnN0IGhhbmRsZUxvY2F0aW9uU2VsZWN0ID0gKGNvb3JkaW5hdGVzOiBbbnVtYmVyLCBudW1iZXJdKSA9PiB7XHJcbiAgICBpZiAoIXVzZXJMb2NhdGlvbikgcmV0dXJuO1xyXG4gICAgY3JlYXRlUm91dGUodXNlckxvY2F0aW9uLCBjb29yZGluYXRlcyk7XHJcbiAgICBzZXRTaG93U2VhcmNoKGZhbHNlKTtcclxuICB9O1xyXG5cclxuICAvLyBBZGQgUE9JIG1hcmtlcnMgdG8gbWFwXHJcbiAgY29uc3QgYWRkUE9Jc1RvTWFwID0gKHBvaXM6IGFueVtdKSA9PiB7XHJcbiAgICAvLyBSZW1vdmUgZXhpc3RpbmcgUE9JIG1hcmtlcnMgZmlyc3RcclxuICAgIGNvbnN0IGV4aXN0aW5nTWFya2VycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5wb2ktbWFya2VyJyk7XHJcbiAgICBleGlzdGluZ01hcmtlcnMuZm9yRWFjaChtYXJrZXIgPT4gbWFya2VyLnJlbW92ZSgpKTtcclxuXHJcbiAgICBwb2lzLmZvckVhY2gocG9pID0+IHtcclxuICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgZWwuY2xhc3NOYW1lID0gYHBvaS1tYXJrZXIgcG9pLSR7cG9pLnR5cGV9YDtcclxuICAgICAgXHJcbiAgICAgIGNvbnN0IHBvcHVwID0gbmV3IG1hcGJveGdsLlBvcHVwKHtcclxuICAgICAgICBvZmZzZXQ6IDI1LFxyXG4gICAgICAgIGNsb3NlQnV0dG9uOiB0cnVlLFxyXG4gICAgICAgIGNsb3NlT25DbGljazogZmFsc2UsXHJcbiAgICAgIH0pXHJcbiAgICAgIC5zZXRIVE1MKGBcclxuICAgICAgICA8ZGl2IHN0eWxlPVwiYmFja2dyb3VuZDogIzFjMTkxNzsgY29sb3I6ICNmZmZmZmY7IHBhZGRpbmc6IDEycHg7XCI+XHJcbiAgICAgICAgICA8aDMgc3R5bGU9XCJjb2xvcjogIzEwYjk4MTsgbWFyZ2luOiAwIDAgNHB4IDA7IGZvbnQtc2l6ZTogMTRweDtcIj4ke3BvaS5uYW1lfTwvaDM+XHJcbiAgICAgICAgICA8cCBzdHlsZT1cImNvbG9yOiAjYThhMjllOyBtYXJnaW46IDA7IGZvbnQtc2l6ZTogMTJweDtcIj4ke3BvaS5kZXNjcmlwdGlvbiB8fCAnJ308L3A+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIGApO1xyXG5cclxuICAgICAgbmV3IG1hcGJveGdsLk1hcmtlcih7XHJcbiAgICAgICAgZWxlbWVudDogZWwsXHJcbiAgICAgICAgYW5jaG9yOiAnYm90dG9tJyxcclxuICAgICAgfSlcclxuICAgICAgICAuc2V0TG5nTGF0KHBvaS5jb29yZGluYXRlcylcclxuICAgICAgICAuc2V0UG9wdXAocG9wdXApXHJcbiAgICAgICAgLmFkZFRvKG1hcEluc3RhbmNlLmN1cnJlbnQhKTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAoIW1hcENvbnRhaW5lci5jdXJyZW50KSByZXR1cm47XHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSBtYXBcclxuICAgIG1hcEluc3RhbmNlLmN1cnJlbnQgPSBuZXcgbWFwYm94Z2wuTWFwKHtcclxuICAgICAgY29udGFpbmVyOiBtYXBDb250YWluZXIuY3VycmVudCxcclxuICAgICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2RhcmstdjExJyxcclxuICAgICAgY2VudGVyOiBbLTEwNS4yNzA1LCA0MC4wMTUwXSxcclxuICAgICAgem9vbTogMTRcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEdldCB1c2VyIGxvY2F0aW9uXHJcbiAgICBpZiAoXCJnZW9sb2NhdGlvblwiIGluIG5hdmlnYXRvcikge1xyXG4gICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKFxyXG4gICAgICAgIChwb3NpdGlvbikgPT4ge1xyXG4gICAgICAgICAgY29uc3QgbG9jYXRpb246IFtudW1iZXIsIG51bWJlcl0gPSBbXHJcbiAgICAgICAgICAgIHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGUsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZVxyXG4gICAgICAgICAgXTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgc2V0VXNlckxvY2F0aW9uKGxvY2F0aW9uKTtcclxuXHJcbiAgICAgICAgICAvLyBDcmVhdGUgY3VzdG9tIEhUTUwgZWxlbWVudCBmb3IgbWFya2VyXHJcbiAgICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgZWwuY2xhc3NOYW1lID0gJ2N1c3RvbS1tYXJrZXInO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBjb25zdCBkb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgIGRvdC5jbGFzc05hbWUgPSAnbWFya2VyLWRvdCc7XHJcbiAgICAgICAgICBlbC5hcHBlbmRDaGlsZChkb3QpO1xyXG5cclxuICAgICAgICAgIGNvbnN0IHB1bHNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICBwdWxzZS5jbGFzc05hbWUgPSAnbWFya2VyLXB1bHNlJztcclxuICAgICAgICAgIGVsLmFwcGVuZENoaWxkKHB1bHNlKTtcclxuXHJcbiAgICAgICAgICAvLyBDcmVhdGUgbmV3IG1hcmtlciB3aXRoIGN1c3RvbSBlbGVtZW50XHJcbiAgICAgICAgICBsb2NhdGlvbk1hcmtlci5jdXJyZW50ID0gbmV3IG1hcGJveGdsLk1hcmtlcih7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IGVsLFxyXG4gICAgICAgICAgICBhbmNob3I6ICdjZW50ZXInXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc2V0TG5nTGF0KGxvY2F0aW9uKVxyXG4gICAgICAgICAgICAuYWRkVG8obWFwSW5zdGFuY2UuY3VycmVudCEpO1xyXG5cclxuICAgICAgICAgIC8vIENlbnRlciBtYXAgb24gbG9jYXRpb25cclxuICAgICAgICAgIG1hcEluc3RhbmNlLmN1cnJlbnQ/LmZseVRvKHtcclxuICAgICAgICAgICAgY2VudGVyOiBsb2NhdGlvbixcclxuICAgICAgICAgICAgem9vbTogMTUsXHJcbiAgICAgICAgICAgIGVzc2VudGlhbDogdHJ1ZVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAoZXJyb3IpID0+IGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgbG9jYXRpb246JywgZXJyb3IpLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGVuYWJsZUhpZ2hBY2N1cmFjeTogdHJ1ZSxcclxuICAgICAgICAgIHRpbWVvdXQ6IDUwMDAsXHJcbiAgICAgICAgICBtYXhpbXVtQWdlOiAwXHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIGlmIChsb2NhdGlvbk1hcmtlci5jdXJyZW50KSB7XHJcbiAgICAgICAgbG9jYXRpb25NYXJrZXIuY3VycmVudC5yZW1vdmUoKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAobWFwSW5zdGFuY2UuY3VycmVudCkge1xyXG4gICAgICAgIG1hcEluc3RhbmNlLmN1cnJlbnQucmVtb3ZlKCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfSwgW10pO1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSB3LWZ1bGwgaC1mdWxsXCI+XHJcbiAgICAgIDxkaXYgcmVmPXttYXBDb250YWluZXJ9IGNsYXNzTmFtZT1cImFic29sdXRlIGluc2V0LTBcIiAvPlxyXG4gICAgICBcclxuICAgICAgey8qIFNlYXJjaCBCdXR0b24gKi99XHJcbiAgICAgIDxidXR0b25cclxuICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaG93U2VhcmNoKHRydWUpfVxyXG4gICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC00IGxlZnQtNCBweC00IHB5LTIgYmctc3RvbmUtODAwIGhvdmVyOmJnLXN0b25lLTcwMCB0ZXh0LXdoaXRlIHJvdW5kZWQtbWQgc2hhZG93LWxnXCJcclxuICAgICAgPlxyXG4gICAgICAgIFNldCBEZXN0aW5hdGlvblxyXG4gICAgICA8L2J1dHRvbj5cclxuXHJcbiAgICAgIHsvKiBTZWFyY2ggUGFuZWwgKi99XHJcbiAgICAgIHtzaG93U2VhcmNoICYmIChcclxuICAgICAgICA8U2VhcmNoUGFuZWxcclxuICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHNldFNob3dTZWFyY2goZmFsc2UpfVxyXG4gICAgICAgICAgb25Mb2NhdGlvblNlbGVjdD17aGFuZGxlTG9jYXRpb25TZWxlY3R9XHJcbiAgICAgICAgLz5cclxuICAgICAgKX1cclxuICAgIDwvZGl2PlxyXG4gICk7XHJcbn1cclxuIl0sIm5hbWVzIjpbInVzZUVmZmVjdCIsInVzZVJlZiIsInVzZVN0YXRlIiwibWFwYm94Z2wiLCJTZWFyY2hQYW5lbCIsImZpbmRQT0lzQWxvbmdSb3V0ZSIsImFjY2Vzc1Rva2VuIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX01BUEJPWF9UT0tFTiIsIk1hcCIsIm1hcENvbnRhaW5lciIsIm1hcEluc3RhbmNlIiwibG9jYXRpb25NYXJrZXIiLCJyb3V0ZVNvdXJjZSIsInNob3dTZWFyY2giLCJzZXRTaG93U2VhcmNoIiwidXNlckxvY2F0aW9uIiwic2V0VXNlckxvY2F0aW9uIiwiY3JlYXRlUm91dGUiLCJzdGFydCIsImVuZCIsInF1ZXJ5IiwiZmV0Y2giLCJqc29uIiwiZGF0YSIsInJvdXRlcyIsInJvdXRlIiwiZ2VvbWV0cnkiLCJjb29yZGluYXRlcyIsImN1cnJlbnQiLCJnZXRTb3VyY2UiLCJhZGRTb3VyY2UiLCJ0eXBlIiwicHJvcGVydGllcyIsImFkZExheWVyIiwiaWQiLCJzb3VyY2UiLCJsYXlvdXQiLCJwYWludCIsInN0ZXAiLCJhbmltYXRpb25TcGVlZCIsImRhc2hBcnJheVNlcXVlbmNlIiwiYW5pbWF0ZUxpbmUiLCJsZW5ndGgiLCJzZXRQYWludFByb3BlcnR5IiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwic2V0VGltZW91dCIsImFkZFBPSXNUb01hcCIsInBvaXMiLCJzZXREYXRhIiwiYm91bmRzIiwicmVkdWNlIiwiY29vcmQiLCJleHRlbmQiLCJMbmdMYXRCb3VuZHMiLCJmaXRCb3VuZHMiLCJwYWRkaW5nIiwiZXJyb3IiLCJjb25zb2xlIiwiaGFuZGxlTG9jYXRpb25TZWxlY3QiLCJleGlzdGluZ01hcmtlcnMiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJmb3JFYWNoIiwibWFya2VyIiwicmVtb3ZlIiwicG9pIiwiZWwiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NOYW1lIiwicG9wdXAiLCJQb3B1cCIsIm9mZnNldCIsImNsb3NlQnV0dG9uIiwiY2xvc2VPbkNsaWNrIiwic2V0SFRNTCIsIm5hbWUiLCJkZXNjcmlwdGlvbiIsIk1hcmtlciIsImVsZW1lbnQiLCJhbmNob3IiLCJzZXRMbmdMYXQiLCJzZXRQb3B1cCIsImFkZFRvIiwiY29udGFpbmVyIiwic3R5bGUiLCJjZW50ZXIiLCJ6b29tIiwibmF2aWdhdG9yIiwiZ2VvbG9jYXRpb24iLCJnZXRDdXJyZW50UG9zaXRpb24iLCJwb3NpdGlvbiIsImxvY2F0aW9uIiwiY29vcmRzIiwibG9uZ2l0dWRlIiwibGF0aXR1ZGUiLCJkb3QiLCJhcHBlbmRDaGlsZCIsInB1bHNlIiwiZmx5VG8iLCJlc3NlbnRpYWwiLCJlbmFibGVIaWdoQWNjdXJhY3kiLCJ0aW1lb3V0IiwibWF4aW11bUFnZSIsImRpdiIsInJlZiIsImJ1dHRvbiIsIm9uQ2xpY2siLCJvbkNsb3NlIiwib25Mb2NhdGlvblNlbGVjdCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/components/Map.tsx\n"));

/***/ })

});