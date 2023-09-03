import * as webserver from '../webserver';
import * as plugins from '../plugins';
import * as groups from '../groups';
import * as index from './index';

// const admin: any = {};

interface Area {
    name: string;
    template?: string;
    location: string;
    data?: any;
}

interface Widget {
    content: string;
}

interface Template {
    template: string;
    areas: Area[];
}


// const admin = module.exports;

export async function getAreas() {
    const defaultAreas = [
        { name: 'Global Sidebar', template: 'global', location: 'sidebar' },
        { name: 'Global Header', template: 'global', location: 'header' },
        { name: 'Global Footer', template: 'global', location: 'footer' },

        { name: 'Group Page (Left)', template: 'groups/details.tpl', location: 'left' },
        { name: 'Group Page (Right)', template: 'groups/details.tpl', location: 'right' },
    ];

    const areas : Array<Area> = await plugins.hooks.fire('filter:widgets.getAreas', defaultAreas);
    areas.push({ name: 'Draft Zone', template: 'global', location: 'drafts' });
    const areaData = await Promise.all(areas.map((area : Area) => index.getArea(area.template, area.location)));
    areas.forEach((area : any, i : number) => {
        area.data = areaData[i];
    });
    return areas;
}

async function renderAdminTemplate() {
    const groupsData = await groups.getNonPrivilegeGroups('groups:createtime', 0, -1);
    groupsData.sort((a, b) => b.system - a.system);
    return await webserver.app.renderAsync('admin/partials/widget-settings', { groups: groupsData });
}

async function getAvailableWidgets() {
    const [availableWidgets, adminTemplate] = await Promise.all([
        plugins.hooks.fire('filter:widgets.getWidgets', []),
        renderAdminTemplate(),
    ]);
    availableWidgets.forEach((w : Widget) => {
        w.content += adminTemplate;
    });
    return availableWidgets;
}

function buildTemplatesFromAreas(areas) {
    const templates : Array<Template> = [];
    const list = {};
    let index = 0;

    areas.forEach((area : Area) => {
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

export async function get() {
    const [areas, availableWidgets] = await Promise.all([
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
}

// require('../promisify')(module.exports);


