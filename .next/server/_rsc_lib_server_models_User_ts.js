"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "_rsc_lib_server_models_User_ts";
exports.ids = ["_rsc_lib_server_models_User_ts"];
exports.modules = {

/***/ "(rsc)/./lib/server/models/User.ts":
/*!***********************************!*\
  !*** ./lib/server/models/User.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   User: () => (/* binding */ User)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst userSchema = new (mongoose__WEBPACK_IMPORTED_MODULE_0___default().Schema)({\n    email: {\n        type: String,\n        required: true,\n        unique: true,\n        lowercase: true,\n        trim: true\n    },\n    password: {\n        type: String,\n        required: true\n    },\n    name: {\n        type: String,\n        required: true,\n        trim: true\n    },\n    role: {\n        type: String,\n        enum: [\n            \"admin\",\n            \"volunteer\",\n            \"attendee\"\n        ],\n        default: \"attendee\"\n    }\n}, {\n    timestamps: true\n});\nconst User = (mongoose__WEBPACK_IMPORTED_MODULE_0___default().models).User || mongoose__WEBPACK_IMPORTED_MODULE_0___default().model(\"User\", userSchema);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc2VydmVyL21vZGVscy9Vc2VyLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFnQztBQVdoQyxNQUFNQyxhQUFhLElBQUlELHdEQUFlLENBQUM7SUFDckNHLE9BQU87UUFDTEMsTUFBTUM7UUFDTkMsVUFBVTtRQUNWQyxRQUFRO1FBQ1JDLFdBQVc7UUFDWEMsTUFBTTtJQUNSO0lBQ0FDLFVBQVU7UUFDUk4sTUFBTUM7UUFDTkMsVUFBVTtJQUNaO0lBQ0FLLE1BQU07UUFDSlAsTUFBTUM7UUFDTkMsVUFBVTtRQUNWRyxNQUFNO0lBQ1I7SUFDQUcsTUFBTTtRQUNKUixNQUFNQztRQUNOUSxNQUFNO1lBQUM7WUFBUztZQUFhO1NBQVc7UUFDeENDLFNBQVM7SUFDWDtBQUNGLEdBQUc7SUFDREMsWUFBWTtBQUNkO0FBRU8sTUFBTUMsT0FBT2hCLHdEQUFlLENBQUNnQixJQUFJLElBQUloQixxREFBYyxDQUFRLFFBQVFDLFlBQVkiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdGlzLWNvbmZlcmVuY2UtcHdhLy4vbGliL3NlcnZlci9tb2RlbHMvVXNlci50cz9hNWFmIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElVc2VyIGV4dGVuZHMgbW9uZ29vc2UuRG9jdW1lbnQge1xyXG4gIGVtYWlsOiBzdHJpbmc7XHJcbiAgcGFzc3dvcmQ6IHN0cmluZztcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgcm9sZTogJ2FkbWluJyB8ICd2b2x1bnRlZXInIHwgJ2F0dGVuZGVlJztcclxuICBjcmVhdGVkQXQ6IERhdGU7XHJcbiAgdXBkYXRlZEF0OiBEYXRlO1xyXG59XHJcblxyXG5jb25zdCB1c2VyU2NoZW1hID0gbmV3IG1vbmdvb3NlLlNjaGVtYSh7XHJcbiAgZW1haWw6IHtcclxuICAgIHR5cGU6IFN0cmluZyxcclxuICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgdW5pcXVlOiB0cnVlLFxyXG4gICAgbG93ZXJjYXNlOiB0cnVlLFxyXG4gICAgdHJpbTogdHJ1ZVxyXG4gIH0sXHJcbiAgcGFzc3dvcmQ6IHtcclxuICAgIHR5cGU6IFN0cmluZyxcclxuICAgIHJlcXVpcmVkOiB0cnVlXHJcbiAgfSxcclxuICBuYW1lOiB7XHJcbiAgICB0eXBlOiBTdHJpbmcsXHJcbiAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgIHRyaW06IHRydWVcclxuICB9LFxyXG4gIHJvbGU6IHtcclxuICAgIHR5cGU6IFN0cmluZyxcclxuICAgIGVudW06IFsnYWRtaW4nLCAndm9sdW50ZWVyJywgJ2F0dGVuZGVlJ10sXHJcbiAgICBkZWZhdWx0OiAnYXR0ZW5kZWUnXHJcbiAgfVxyXG59LCB7XHJcbiAgdGltZXN0YW1wczogdHJ1ZVxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBVc2VyID0gbW9uZ29vc2UubW9kZWxzLlVzZXIgfHwgbW9uZ29vc2UubW9kZWw8SVVzZXI+KCdVc2VyJywgdXNlclNjaGVtYSk7XHJcblxyXG4iXSwibmFtZXMiOlsibW9uZ29vc2UiLCJ1c2VyU2NoZW1hIiwiU2NoZW1hIiwiZW1haWwiLCJ0eXBlIiwiU3RyaW5nIiwicmVxdWlyZWQiLCJ1bmlxdWUiLCJsb3dlcmNhc2UiLCJ0cmltIiwicGFzc3dvcmQiLCJuYW1lIiwicm9sZSIsImVudW0iLCJkZWZhdWx0IiwidGltZXN0YW1wcyIsIlVzZXIiLCJtb2RlbHMiLCJtb2RlbCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./lib/server/models/User.ts\n");

/***/ })

};
;