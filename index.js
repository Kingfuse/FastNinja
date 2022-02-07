const fs = require('fs'),
    path = require('path');

module.exports = function NinjaJS(mod) {
    const { command } = mod;
    const { player } = mod.require.library;

    let skill_ids = {};
    let isEnabled = true;
    let lastTimeout = null;
    let config_file = require('./config.json');

    if (config_file['COMBO_CANCEL_DELAY'] && typeof config_file['COMBO_CANCEL_DELAY'] === "number") {
        skill_ids['1'] = {
            'delay': config_file['COMBO_CANCEL_DELAY'],
			'fixedDelay': true
        };
    }
    if (config_file['SKYFALL_CANCEL_DELAY'] && typeof config_file['SKYFALL_CANCEL_DELAY'] === "number") {
        skill_ids['12'] = {
            'delay': config_file['SKYFALL_CANCEL_DELAY'],
			'fixedDelay': true
        };
    }
    if (config_file['CIRCLE_OF_STEEL_CANCEL_DELAY'] && typeof config_file['CIRCLE_OF_STEEL_CANCEL_DELAY'] === "number") {
        skill_ids['13'] = {
            'delay': config_file['CIRCLE_OF_STEEL_CANCEL_DELAY'],
			'fixedDelay': true
        };
    }
    if (config_file['DOUBLE_CUT_CANCEL_DELAY'] && typeof config_file['DOUBLE_CUT_CANCEL_DELAY'] === "number") {
        skill_ids['14'] = {
            'delay': config_file['DOUBLE_CUT_CANCEL_DELAY'],
			'fixedDelay': true
        };
    }
    if (config_file['BURNING_HEART_DELAY'] && typeof config_file['BURNING_HEART_CANCEL_DELAY'] === "number") {
        skill_ids['15'] = {
            'delay': config_file['BURNING_HEART_CANCEL_DELAY'],
			'fixedDelay': true
        };
    }
    if (config_file['QUICK_ATTACK_DELAY'] && typeof config_file['QUICK_ATTACK_CANCEL_DELAY'] === "number") {
        skill_ids['22'] = {
            'delay': config_file['DQUICK ATTACK_CANCEL_DELAY'],
			'fixedDelay': true
        };
    }
	
    command.add('fastninja', {
        '$default'() {
            isEnabled = !isEnabled;
            command.message(' ninja script is now ' + (isEnabled ? 'enabled' : 'disabled') + '.');
        }
    });

    mod.hook('S_ACTION_STAGE', 9, { order: -999999, filter: {fake: true} }, event => {
	//mod.hook('S_ACTION_STAGE', 9, event => {

        if (!isEnabled || event.gameId !== mod.game.me.gameId || mod.game.me.class !== 'assassin') return;

        const skill_id = Math.floor(event.skill.id / 10000);
        const altSkill_id = event.skill.id % 100;

        if (skill_id in skill_ids || skill_id + '-' + altSkill_id in skill_ids) {

            const skillInfo = skill_id in skill_ids ? skill_ids[skill_id] : skill_ids[skill_id + '-' + altSkill_id];

            lastTimeout = mod.setTimeout(() => {
                mod.toClient('S_ACTION_END', 5, {
                    gameId: event.gameId,
                    loc: {
                        x: event.loc.x,
                        y: event.loc.y,
                        z: event.loc.z
                    },
                    w: event.w,
                    templateId: event.templateId,
                    skill: event.skill.id,
                    type: 12394123,
                    id: event.id
                });

            }, skillInfo['fixedDelay'] ? skillInfo['delay'] : skillInfo['delay'] / player['aspd']);
        }
    });
    
    mod.hook('S_ACTION_END', 5, {'order': -999999,'filter': {'fake': true }}, event => {
        if (!isEnabled || event.gameId !== mod.game.me.gameId || mod.game.me.class !== 'assassin') return;

        const skill_id = Math.floor(event.skill.id / 10000);
        const altSkill_id = event.skill.id % 100;

        if (lastTimeout && (skill_id in skill_ids || skill_id + '-' + altSkill_id in skill_ids)) {
            lastTimeout = null;
            if (event.type == 12394123) {
                event.type = 4;
                return true;
            } else {
                return false;
            }
        }
    });

    mod.hook('C_CANCEL_SKILL', 3, event => {
        if (!isEnabled || mod.game.me.class !== 'assassin') return;

        if (lastTimeout) {
            mod.clearTimeout(lastTimeout);
            lastTimeout = null;
        }
    });

    mod.hook('S_EACH_SKILL_RESULT', 15, { 'order': -999999 }, event => {
        if (!isEnabled || !lastTimeout || event.target !== mod.game.me.gameId || !event.reaction.enable) return;
        mod.clearTimeout(lastTimeout);
        lastTimeout = null;        
    });
}
