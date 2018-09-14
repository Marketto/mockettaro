'use strict';

const chalk = require('chalk');

class Logger {
    constructor({
        debug = false,
        info = true,
        warn = true,
        error = true
    } = {
        debug : false,
        info : true,
        warn : true, 
        error : true
    }){
        Object.defineProperties(this, {
            'cfg' : {
                'configurable' : false,
                'writable' : true,
                'enumerable' : false,
                'value' : {}
            },
            'colors' : {
                'configurable' : false,
                'writable' : false,
                'enumerable' : false,
                'value' : [
                    'black',
                    'red',
                    'green',
                    'yellow',
                    'blue',
                    'magenta',
                    'cyan',
                    'white',
                    'gray',
                    'redBright',
                    'greenBright',
                    'yellowBright',
                    'blueBright',
                    'magentaBright',
                    'cyanBright',
                    'whiteBright'
                ]
            }
        });
        
        this.config = {
            debug,
            info,
            warn, 
            error
        };
    }
    get config(){
        const DEFAULT_DEBUG_COLOR = "magenta";
        const DEFAULT_INFO_COLOR = "blue";
        const DEFAULT_WARN_COLOR = "yellow";
        const DEFAULT_ERROR_COLOR = "red";


        const cfg = {};
        Object.defineProperties(cfg, {
            'debug'   : {
                get: () => this.cfg.debug,
                set: color => {
                    if (this.colors.includes(color)){
                        this.cfg.debug = color;
                    } else {
                        this.cfg.debug = !!color && DEFAULT_DEBUG_COLOR;
                    }
                }
            },
            'info'    : {
                get: () => this.cfg.info,
                set: color => {
                    if (this.colors.includes(color)){
                        this.cfg.info = color;
                    } else {
                        this.cfg.info = !!color && DEFAULT_INFO_COLOR;
                    }
                }
            },
            'warn'    : {
                get: () => this.cfg.warn,
                set: color => {
                    if (this.colors.includes(color)){
                        this.cfg.warn = color;
                    } else {
                        this.cfg.warn = !!color && DEFAULT_WARN_COLOR;
                    }
                }
            },
            'error'   : {
                get: () => this.cfg.error,
                set: color => {
                    if (this.colors.includes(color)){
                        this.cfg.error = color;
                    } else {
                        this.cfg.error = !!color && DEFAULT_ERROR_COLOR;
                    }
                }
            }
        })
        return cfg;
    }
    set config({debug, info, warn, error}){
        const configurator = this.config;
        configurator.debug = debug;
        configurator.info = info;
        configurator.warn = warn;
        configurator.error = error;
    }

    info(msg){
        return this.cfg.info && console.info(chalk[this.cfg.info](`[INF] ${msg}`));
    }
    debug(msg){
        return this.cfg.debug && console.log(chalk[this.cfg.debug](`[DBG] ${msg}`));
    }
    warn(msg){
        return this.cfg.warn && console.warn(chalk[this.cfg.warn](`[WRN] ${msg}`));
    }
    error(msg){
        return this.cfg.error && console.error(chalk[this.cfg.error](`[ERR] ${msg}`));
    }
}

exports.Logger = Logger;
exports.global = cfg => {
    return global.logger = global.logger || new Logger(cfg);
};