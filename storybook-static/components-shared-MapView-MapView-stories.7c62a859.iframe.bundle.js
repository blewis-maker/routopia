"use strict";(self.webpackChunkroutopia=self.webpackChunkroutopia||[]).push([[915],{"./src/components/shared/MapView/MapView.stories.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,WithMarkers:()=>WithMarkers,WithRoute:()=>WithRoute,__namedExportsOrder:()=>__namedExportsOrder,default:()=>MapView_stories});var jsx_runtime=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),react=__webpack_require__("./node_modules/next/dist/compiled/react/index.js"),mapbox_gl=__webpack_require__("./node_modules/mapbox-gl/dist/mapbox-gl.js"),mapbox_gl_default=__webpack_require__.n(mapbox_gl);const MAPBOX_TOKEN="pk.eyJ1Ijoicm91dG9waWEtYWkiLCJhIjoiY200MWkzb25xMHFtcjJxcHRmOTE3NTlrNSJ9.d2Ds8SJXnQzc2W1o50D76Q";mapbox_gl_default().accessToken=MAPBOX_TOKEN;const mapboxService=new class MapboxService{createMap(options){return new(mapbox_gl_default().Map)({container:options.container,style:options.style||"mapbox://styles/mapbox/dark-v11",center:options.center||[-74.5,40],zoom:options.zoom||9})}createMarker(options={}){return new(mapbox_gl_default().Marker)({color:options.color,draggable:options.draggable})}async getRoute(start,end){const query=await fetch(`https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`);return(await query.json()).routes[0]}async searchPlace(query){const response=await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}`);return(await response.json()).features}};__webpack_require__("./node_modules/mapbox-gl/dist/mapbox-gl.css");function MapView({center=[-74.5,40],zoom=9,onMapLoad,className=""}){const mapContainer=(0,react.useRef)(null),map=(0,react.useRef)(null),[loaded,setLoaded]=(0,react.useState)(!1);return(0,react.useEffect)((()=>{if(mapContainer.current&&!map.current)return map.current=mapboxService.createMap({container:mapContainer.current,center,zoom}),map.current.on("load",(()=>{setLoaded(!0),onMapLoad&&map.current&&onMapLoad(map.current)})),()=>{map.current&&(map.current.remove(),map.current=null)}}),[center,zoom,onMapLoad]),(0,jsx_runtime.jsx)("div",{ref:mapContainer,className:`map-view w-full h-full min-h-[400px] ${className}`})}try{MapView.displayName="MapView",MapView.__docgenInfo={description:"",displayName:"MapView",props:{center:{defaultValue:{value:"[-74.5, 40]"},description:"",name:"center",required:!1,type:{name:"[number, number]"}},zoom:{defaultValue:{value:"9"},description:"",name:"zoom",required:!1,type:{name:"number"}},onMapLoad:{defaultValue:null,description:"",name:"onMapLoad",required:!1,type:{name:"((map: Map) => void)"}},className:{defaultValue:{value:""},description:"",name:"className",required:!1,type:{name:"string"}}}},"undefined"!=typeof STORYBOOK_REACT_CLASSES&&(STORYBOOK_REACT_CLASSES["src/components/shared/MapView/index.tsx#MapView"]={docgenInfo:MapView.__docgenInfo,name:"MapView",path:"src/components/shared/MapView/index.tsx#MapView"})}catch(__react_docgen_typescript_loader_error){}const MapView_stories={title:"Components/Shared/MapView",component:MapView,parameters:{layout:"fullscreen",chromatic:{delay:1e3}},args:{center:[-74.5,40],zoom:9}},Default={args:{}},WithMarkers={args:{markers:[{lat:40,lng:-74,label:"Start"},{lat:40.1,lng:-74.2,label:"End"}]}},WithRoute={args:{route:{coordinates:[[-74,40],[-74.1,40.05],[-74.2,40.1]],color:"#FF0000"}}},__namedExportsOrder=["Default","WithMarkers","WithRoute"];Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:"{\n  args: {}\n}",...Default.parameters?.docs?.source}}},WithMarkers.parameters={...WithMarkers.parameters,docs:{...WithMarkers.parameters?.docs,source:{originalSource:"{\n  args: {\n    markers: [{\n      lat: 40,\n      lng: -74,\n      label: 'Start'\n    }, {\n      lat: 40.1,\n      lng: -74.2,\n      label: 'End'\n    }]\n  }\n}",...WithMarkers.parameters?.docs?.source}}},WithRoute.parameters={...WithRoute.parameters,docs:{...WithRoute.parameters?.docs,source:{originalSource:"{\n  args: {\n    route: {\n      coordinates: [[-74, 40], [-74.1, 40.05], [-74.2, 40.1]],\n      color: '#FF0000'\n    }\n  }\n}",...WithRoute.parameters?.docs?.source}}}}}]);