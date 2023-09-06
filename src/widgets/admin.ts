import webserver from '../webserver';
import plugins from '../plugins';
import groups from '../groups';
import index from './index';
import promisify from '../promisify';

type Area = {
    name: string;
    template?: string;
    location: string;
    data?: any;
}

type Widget = {
    content: string;
}

type Template = {
    template: string;
    areas: Area[];
}

type AdminGet = {
    templates: Array<Template>;
    areas: Array<Area>;
    availableWidgets: Array<Widget>;
}


export async function getAreas() : Promise<Array<Area>> {
    const defaultAreas = [
        { name: 'Global Sidebar', template: 'global', location: 'sidebar' },
        { name: 'Global Header', template: 'global', location: 'header' },
        { name: 'Global Footer', template: 'global', location: 'footer' },

        { name: 'Group Page (Left)', template: 'groups/details.tpl', location: 'left' },
        { name: 'Group Page (Right)', template: 'groups/details.tpl', location: 'right' },
    ];
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const areas : Array<Area> = await plugins.hooks.fire('filter:widgets.getAreas', defaultAreas);
    areas.push({ name: 'Draft Zone', template: 'global', location: 'drafts' });
    const areaData = await Promise.all(areas.map((area : Area) => index.getArea(area.template, area.location)));
    areas.forEach((area : Area, i : number) => {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        area.data = areaData[i];
    });
    return areas;
}

async function renderAdminTemplate() {
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const groupsData = await groups.getNonPrivilegeGroups('groups:createtime', 0, -1);
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    groupsData.sort((a, b) => b.system - a.system);
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return await webserver.app.renderAsync('admin/partials/widget-settings', { groups: groupsData }); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
}

async function getAvailableWidgets() : Promise<Array<Widget>> {
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const [availableWidgets, adminTemplate] : [Array<Widget>, Array<Template>] = await Promise.all([
        plugins.hooks.fire('filter:widgets.getWidgets', []),
        renderAdminTemplate(),
    ]);
    availableWidgets.forEach((w : Widget) => {
        w.content += adminTemplate;
    });
    return availableWidgets;
}

function buildTemplatesFromAreas(areas : Array<Area>) : Array<Template> {
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

export async function get() : Promise<AdminGet> {
    const [areas, availableWidgets] : [Array<Area>, Array<Widget>] = await Promise.all([
        getAreas(),
        getAvailableWidgets(),
    ]);

    return {
        templates: buildTemplatesFromAreas(areas),
        areas: areas,
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        availableWidgets: availableWidgets,
    };
}

promisify(exports);


