"use strict";(self.webpackChunkroutopia=self.webpackChunkroutopia||[]).push([[651],{"./src/components/shared/ActivityTracker/ActivityTracker.stories.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Empty:()=>Empty,Error:()=>Error,Loading:()=>Loading,WithActivities:()=>WithActivities,WithFilters:()=>WithFilters,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});const __WEBPACK_DEFAULT_EXPORT__={title:"Components/Shared/ActivityTracker",component:__webpack_require__("./src/components/shared/ActivityTracker/index.tsx").m,parameters:{layout:"centered"}},Empty={args:{activities:[]}},WithActivities={args:{activities:[{id:"1",type:"route",name:"Morning Run",distance:5.2,duration:1800,date:new Date("2023-12-07T08:00:00")},{id:"2",type:"cycling",name:"Evening Ride",distance:15.5,duration:3600,date:new Date("2023-12-06T18:00:00")},{id:"3",type:"hiking",name:"Weekend Trail",distance:8.3,duration:7200,date:new Date("2023-12-05T10:00:00")}]}},Loading={args:{isLoading:!0}},Error={args:{error:"Failed to load activities"}},WithFilters={args:{activities:[{id:"1",type:"route",name:"Morning Run",distance:5.2,duration:1800,date:new Date("2023-12-07T08:00:00")},{id:"2",type:"cycling",name:"Evening Ride",distance:15.5,duration:3600,date:new Date("2023-12-06T18:00:00")}],filters:{type:["route","cycling"],dateRange:{start:new Date("2023-12-01"),end:new Date("2023-12-31")}}}},__namedExportsOrder=["Empty","WithActivities","Loading","Error","WithFilters"];Empty.parameters={...Empty.parameters,docs:{...Empty.parameters?.docs,source:{originalSource:"{\n  args: {\n    activities: []\n  }\n}",...Empty.parameters?.docs?.source}}},WithActivities.parameters={...WithActivities.parameters,docs:{...WithActivities.parameters?.docs,source:{originalSource:"{\n  args: {\n    activities: [{\n      id: '1',\n      type: 'route',\n      name: 'Morning Run',\n      distance: 5.2,\n      duration: 1800,\n      date: new Date('2023-12-07T08:00:00')\n    }, {\n      id: '2',\n      type: 'cycling',\n      name: 'Evening Ride',\n      distance: 15.5,\n      duration: 3600,\n      date: new Date('2023-12-06T18:00:00')\n    }, {\n      id: '3',\n      type: 'hiking',\n      name: 'Weekend Trail',\n      distance: 8.3,\n      duration: 7200,\n      date: new Date('2023-12-05T10:00:00')\n    }]\n  }\n}",...WithActivities.parameters?.docs?.source}}},Loading.parameters={...Loading.parameters,docs:{...Loading.parameters?.docs,source:{originalSource:"{\n  args: {\n    isLoading: true\n  }\n}",...Loading.parameters?.docs?.source}}},Error.parameters={...Error.parameters,docs:{...Error.parameters?.docs,source:{originalSource:"{\n  args: {\n    error: 'Failed to load activities'\n  }\n}",...Error.parameters?.docs?.source}}},WithFilters.parameters={...WithFilters.parameters,docs:{...WithFilters.parameters?.docs,source:{originalSource:"{\n  args: {\n    activities: [{\n      id: '1',\n      type: 'route',\n      name: 'Morning Run',\n      distance: 5.2,\n      duration: 1800,\n      date: new Date('2023-12-07T08:00:00')\n    }, {\n      id: '2',\n      type: 'cycling',\n      name: 'Evening Ride',\n      distance: 15.5,\n      duration: 3600,\n      date: new Date('2023-12-06T18:00:00')\n    }],\n    filters: {\n      type: ['route', 'cycling'],\n      dateRange: {\n        start: new Date('2023-12-01'),\n        end: new Date('2023-12-31')\n      }\n    }\n  }\n}",...WithFilters.parameters?.docs?.source}}}},"./src/components/shared/ActivityTracker/index.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{m:()=>ActivityTracker});var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("./node_modules/next/dist/compiled/react/jsx-runtime.js"),react__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("./node_modules/next/dist/compiled/react/index.js");function ActivityTracker(){const[activities,setActivities]=(0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]),[loading,setLoading]=(0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(!0);return(0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)((()=>{setTimeout((()=>{setActivities([{id:"1",type:"Running",duration:45,distance:5.2,date:"2024-01-10"},{id:"2",type:"Cycling",duration:90,distance:20.5,date:"2024-01-09"}]),setLoading(!1)}),1e3)}),[]),loading?(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div",{className:"activity-tracker activity-tracker--loading",children:"Loading..."}):(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div",{className:"activity-tracker",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h2",{className:"activity-tracker__title",children:"Recent Activities"}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div",{className:"activity-tracker__list",children:activities.map((activity=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div",{className:"activity-tracker__item",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div",{className:"activity-tracker__type",children:activity.type}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div",{className:"activity-tracker__stats",children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span",{children:[activity.distance," miles"]}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span",{children:[activity.duration," minutes"]})]}),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div",{className:"activity-tracker__date",children:activity.date})]},activity.id)))})]})}}}]);