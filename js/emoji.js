/**@license
 *       __ _____                     ________                              __
 *      / // _  /__ __ _____ ___ __ _/__  ___/__ ___ ______ __ __  __ ___  / /
 *  __ / // // // // // _  // _// // / / // _  // _//     // //  \/ // _ \/ /
 * /  / // // // // // ___// / / // / / // ___// / / / / // // /\  // // / /__
 * \___//____ \\___//____//_/ _\_  / /_//____//_/ /_/ /_//_//_/ /_/ \__\_\___/
 *           \/              /____/
 * http://terminal.jcubic.pl
 *
 * this is formatter for jQuery Terminal that add support for emoji
 *
 * Copyright (c) 2019 Jakub Jankiewicz <https://jcubic.pl/me>
 * Released under the MIT license
 *
 */
/* global jQuery, define, global, require, module */
(function(factory, undefined) {
    var root = typeof window !== 'undefined' ? window : global;
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        // istanbul ignore next
        define(['prismjs', 'jquery', 'jquery.terminal'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function(root, jQuery, Prism) {
            if (Prism === undefined) {
                Prism = require('prismjs');
            }
            if (jQuery === undefined) {
                // require('jQuery') returns a factory that requires window to
                // build a jQuery instance, we normalize how we use modules
                // that require this pattern but the window provided is a noop
                // if it's defined (how jquery works)
                if (window !== undefined) {
                    jQuery = require('jquery');
                } else {
                    jQuery = require('jquery')(root);
                }
            }
            if (!jQuery.fn.terminal) {
                if (window !== undefined) {
                    require('jquery.terminal');
                } else {
                    require('jquery.terminal')(jQuery);
                }
            }
            factory(jQuery, Prism);
            return jQuery;
        };
    } else {
        // Browser
        // istanbul ignore next
        factory(root.jQuery, root.Prism);
    }
})(function($) {
    // emoji_data param need to be JavaScript object from
    // https://unpkg.com/emoji-datasource-twitter/emoji.json
    $.terminal.emoji = function(emoji_data) {
        var text = {};
        var names = [];
        emoji_data.forEach(function(emoji) {
            if (emoji.text && !text[emoji.text]) {
                text[emoji.text] = emoji.short_name;
            }
            names.push(emoji.short_name);
        });
        // new API from version 1.10.0, old one with function will still work but
        // if you need to use replacement that change length of the input text
        // you need to use [regex, str] or function formatter where you use
        // $.terminal.tracking_replace that returns [string, position] the same
        // should be returned by formatter, optionally you can check if options
        // have position
        $.terminal.defaults.formatters.push([
            new RegExp(':(' + names.map(function(name) {
                return $.terminal.escape_regex(name);
            }).join('|') + '):', 'g'),
            '[[;;;emoji $1]⻇]'
        ]);
        Object.keys(text).forEach(function(name) {
            $.terminal.defaults.formatters.push([
                new RegExp($.terminal.escape_regex(name), 'g'),
                '[[;;;emoji ' + text[name] + ']⻇]'
            ]);
        });
        // this is unicode emoji handling
        $.terminal.defaults.formatters.push(function(string, options) {
            var result = [string, options.position];
            emoji_data.forEach(function(emoji) {
                if (emoji.unified) {
                    var unicode = emoji.unified.split('-').map(function(u) {
                        return '\\u' + u;
                    }).join('');
                    var re = new RegExp('(' + unicode + ')', 'gu');
                    if (re.test(result[0])) {
                        result = $.terminal.tracking_replace(
                            result[0],
                            re,
                            '[[;;;emoji ' + emoji.short_name + ']$1]',
                            result[1]
                        );
                    }
                }
            });
            return result;
        });
    };
});
