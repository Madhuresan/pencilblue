/*
    Copyright (C) 2014  PencilBlue, LLC

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * Interface for editing the navigation
 */

function SectionMap(){}

//dependencies
var SectionService = pb.SectionService;

//inheritance
util.inherits(SectionMap, pb.BaseController);

//statics
var SUB_NAV_KEY = 'navigation_map';

SectionMap.prototype.render = function(cb) {
	var self = this;
	var dao  = new pb.DAO();
	dao.query('section', pb.DAO.ANYWHERE).then(function(sections) {

		//when no sections exist redirect to create page
        if(sections.length === 0) {
            cb(pb.RequestHandler.generateRedirect(pb.config.siteRoot + '/admin/content/sections/new_section'));
            return;
        }

        pb.settings.get('section_map', function(err, sectionMap) {
            if(sectionMap === null) {
            	cb(pb.RequestHandler.generateRedirect(pb.config.siteRoot + '/admin/content/sections/new_section'));
                return;
            }

            self.setPageName(self.ls.get('NAV_MAP'));
	        self.ts.load('admin/content/sections/section_map', function(err, data) {
                var result = data;

                var pills   = pb.AdminSubnavService.get(SUB_NAV_KEY, self.ls, SUB_NAV_KEY);
                var objects = {
                    navigation: pb.AdminNavigation.get(self.session, ['content', 'sections'], self.ls),
                    pills: pills,
                    sections: SectionMap.getOrderedSections(sections, sectionMap),
                    icons: {
                    	container: 'inbox',
                    	section: 'th-large',
                    	article: 'files-o',
                    	page: 'file-o',
                    	link: 'link'
                    }
                };

                var angularData = pb.js.getAngularController(objects);
                result          = result.split('^angular_script^').join(angularData);

                cb({content: result});
            });
        });
    });
};

SectionMap.getOrderedSections = function(sections, sectionMap) {

	var orderedSections = [];
    for(var i = 0; i < sectionMap.length; i++) {

    	var parentSection = null;
        for(var j = 0; j < sections.length; j++) {
            if(sectionMap[i].uid == sections[j]._id) {
                parentSection          = sections[j];
                parentSection.children = [];
                break;
            }
        }

        if(!parentSection) {
            continue;
        }

        for(var o = 0; o < sectionMap[i].children.length; o++) {
            for(var j = 0; j < sections.length; j++) {
                if(sectionMap[i].children[o].uid == sections[j]._id) {
                    parentSection.children.push(sections[j]);
                    break;
                }
            }
        }

        orderedSections.push(parentSection);
    }

    return orderedSections;
};

SectionMap.getSubNavItems = function(key, ls, data) {
	var pills = SectionService.getPillNavOptions();
	pills.unshift(
    {
        name: SUB_NAV_KEY,
        title: ls.get('NAV_MAP'),
        icon: 'refresh',
        href: '/admin/content/sections/section_map'
    });
    return pills;
};

//register admin sub-nav
pb.AdminSubnavService.registerFor(SUB_NAV_KEY, SectionMap.getSubNavItems);

//exports
module.exports = SectionMap;
