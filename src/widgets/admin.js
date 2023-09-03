"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = exports.getAreas = void 0;
const webserver = __importStar(require("../webserver"));
const plugins = __importStar(require("../plugins"));
const groups = __importStar(require("../groups"));
const index = __importStar(require("./index"));
// const admin = module.exports;
function getAreas() {
    return __awaiter(this, void 0, void 0, function* () {
        const defaultAreas = [
            { name: 'Global Sidebar', template: 'global', location: 'sidebar' },
            { name: 'Global Header', template: 'global', location: 'header' },
            { name: 'Global Footer', template: 'global', location: 'footer' },
            { name: 'Group Page (Left)', template: 'groups/details.tpl', location: 'left' },
            { name: 'Group Page (Right)', template: 'groups/details.tpl', location: 'right' },
        ];
        const areas = yield plugins.hooks.fire('filter:widgets.getAreas', defaultAreas);
        areas.push({ name: 'Draft Zone', template: 'global', location: 'drafts' });
        const areaData = yield Promise.all(areas.map((area) => index.getArea(area.template, area.location)));
        areas.forEach((area, i) => {
            area.data = areaData[i];
        });
        return areas;
    });
}
exports.getAreas = getAreas;
function renderAdminTemplate() {
    return __awaiter(this, void 0, void 0, function* () {
        const groupsData = yield groups.getNonPrivilegeGroups('groups:createtime', 0, -1);
        groupsData.sort((a, b) => b.system - a.system);
        return yield webserver.app.renderAsync('admin/partials/widget-settings', { groups: groupsData });
    });
}
function getAvailableWidgets() {
    return __awaiter(this, void 0, void 0, function* () {
        const [availableWidgets, adminTemplate] = yield Promise.all([
            plugins.hooks.fire('filter:widgets.getWidgets', []),
            renderAdminTemplate(),
        ]);
        availableWidgets.forEach((w) => {
            w.content += adminTemplate;
        });
        return availableWidgets;
    });
}
function buildTemplatesFromAreas(areas) {
    const templates = [];
    const list = {};
    let index = 0;
    areas.forEach((area) => {
        if (typeof list[area.template] === 'undefined') {
            list[area.template] = index;
            templates.push({
                template: area.template,
                areas: [],
            });
            index += 1;
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        templates[list[area.template]].areas.push({
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            name: area.name,
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            location: area.location,
        });
    });
    return templates;
}
function get() {
    return __awaiter(this, void 0, void 0, function* () {
        const [areas, availableWidgets] = yield Promise.all([
            getAreas(),
            getAvailableWidgets(),
        ]);
        return {
            templates: buildTemplatesFromAreas(areas),
            areas: areas,
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            availableWidgets: availableWidgets,
        };
    });
}
exports.get = get;
// require('../promisify')(module.exports);
// 'use strict';
// import * as webserver from '../webserver';
// import * as plugins from '../plugins';
// import * as groups from '../groups';
// import * as index from './index';
// interface Area {
//   name: string;
//   template: string;
//   location: string;
//   data?: any;
// }
// interface Widget {
//   content: string;
// }
// interface Template {
//   template: string;
//   areas: Area[];
// }
// const admin: any = {};
// admin.get = async function (): Promise<any> {
//   const [areas, availableWidgets] = await Promise.all([
//     admin.getAreas(),
//     getAvailableWidgets(),
//   ]);
//   return {
//     templates: buildTemplatesFromAreas(areas),
//     areas: areas,
//     availableWidgets: availableWidgets,
//   };
// };
// admin.getAreas = async function (): Promise<Area[]> {
//   const defaultAreas: Area[] = [
//     { name: 'Global Sidebar', template: 'global', location: 'sidebar' },
//     { name: 'Global Header', template: 'global', location: 'header' },
//     { name: 'Global Footer', template: 'global', location: 'footer' },
//     { name: 'Group Page (Left)', template: 'groups/details.tpl', location: 'left' },
//     { name: 'Group Page (Right)', template: 'groups/details.tpl', location: 'right' },
//   ];
//   const areas = await plugins.hooks.fire('filter:widgets.getAreas', defaultAreas);
//   areas.push({ name: 'Draft Zone', template: 'global', location: 'drafts' });
//   const areaData = await Promise.all(areas.map(area => index.getArea(area.template, area.location)));
//   areas.forEach((area, i) => {
//     area.data = areaData[i];
//   });
//   return areas;
// };
// async function getAvailableWidgets(): Promise<Widget[]> {
//   const [availableWidgets, adminTemplate] = await Promise.all([
//     plugins.hooks.fire('filter:widgets.getWidgets', []),
//     renderAdminTemplate(),
//   ]);
//   availableWidgets.forEach((w) => {
//     w.content += adminTemplate;
//   });
//   return availableWidgets;
// }
// async function renderAdminTemplate(): Promise<string> {
//   const groupsData = await groups.getNonPrivilegeGroups('groups:createtime', 0, -1);
//   groupsData.sort((a, b) => b.system - a.system);
//   groupsData.sort((a, b) => b.system - a.system);
//   return await webserver.app.renderAsync('admin/partials/widget-settings', { groups: groupsData });
// }
// function buildTemplatesFromAreas(areas: Area[]): Template[] {
//   const templates: Template[] = [];
//   const list: { [key: string]: number } = {};
//   let index = 0;
//   areas.forEach((area) => {
//     if (typeof list[area.template] === 'undefined') {
//       list[area.template] = index;
//       templates.push({
//         template: area.template,
//         areas: [],
//       });
//       index += 1;
//     }
//     templates[list[area.template]].areas.push({
//       name: area.name,
//       location: area.location,
//     });
//   });
//   return templates;
// }
// require('../promisify')(admin);
