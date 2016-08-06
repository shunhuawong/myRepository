define('jira-credits-game', ['require'], function(require){

    var $ = require('jquery');
    var contributorBlob = require('jira-credits-contributor-blob');
    var properties = require('jira-credits-web-action-properties');

    var Credits = {
        // CONSTANTS
        keybindKey: 'keydown.credits.global',
        clickbindKey: 'click.credits.global',

        // SOUNDS
        soundOn: true,

        // LIFE CYCLE
        init: function () {
            Credits.addKeyBinding();
            Credits.addClickBinding();
            Credits.render(Credits.SCREEN.HOME);
            //Credits.play('theme');
            Credits.showMenu();
        },
        deinit: function() {
            Credits.Game.deinit();
            Credits.List.deinit();
            Credits.Home.deinit();

            $(document)
                .unbind(Credits.keybindKey)
                .unbind(Credits.clickbindKey);

            Credits.soundOn = false;

            setTimeout(function(){
                Credits = null;
            }, 1);
        },

        addKeyBinding: function() {
            $(document)
                .on(Credits.keybindKey, null, '0', Credits.Game.goToUser('Robert J Chatfield'))
                .on(Credits.keybindKey, null, '1', Credits.Game.goToUser('Kerrod Williams'))
                .on(Credits.keybindKey, null, '2', Credits.Game.goToUser('Daniel Kerris'))
        },

        addClickBinding: function() {
            $(document).on(Credits.clickbindKey, '.jira-credits-sound-button', function() {
                Credits.soundOn = !Credits.soundOn;
                Credits.play('turnOn');
                if (Credits.soundOn) {
                    $('.jira-credits-sound-button').removeClass('jira-credits-sound-button-off');
                } else {
                    $('.jira-credits-sound-button').addClass('jira-credits-sound-button-off');
                }
            });
        },

        showMenu: function() {
            $('#jira-credits-home-loading').hide();
            $('#jira-credits-home-menu').show();
        },

        // SOUND
        play: function(key) {
            Credits.shouldDeinit(); // sneaky cleanup

            if (Credits.soundOn) {
                var sound = Credits.Sound[key];
                if(sound.readyState > 0) {
                    sound.currentTime = 0;
                    sound.play();
                }
            }

        },

        // HELPER
        shouldDeinit: function() {
            if ($('#jira-credits-container').length === 0) {
                Credits.deinit();
            }
        },

        calcScrollingState: function(direction, pa, pb, pc, viewportPadding, viewportRange, boardRange) {
            var FIRST_ABSOLUTE = 0;
            var FIRST_PADDING = viewportPadding;
            var FIRST_VIEWPORT_END = viewportRange;
            var SECOND_VIEWPORT = 2*viewportRange;

            var SECOND_LAST_VIEWPORT = boardRange - 2*viewportRange;
            var LAST_VIEWPORT_START = boardRange - viewportRange;
            var LAST_PADDING = boardRange - viewportPadding;
            var LAST_ABSOLUTE = boardRange - 1;

            var LAST_CURSOR = viewportRange - 1;

            var LOWER_PADDING_BOUNDARY = viewportPadding;
            var UPPER_PADDING_BOUNDARY = viewportRange - viewportPadding;

            // GUARD
            switch (direction) {
                case '+':
                {
                    if (pa >= LAST_ABSOLUTE) {
                        // don't move
                        return {
                            absolute: LAST_ABSOLUTE,
                            rangeOffset: -1 * LAST_VIEWPORT_START,
                            cursor: LAST_CURSOR,
                        };
                    }
                    else if (pa >= LAST_PADDING) {
                        // MAX, scroll cursor
                        return {
                            absolute: pa + 1,
                            rangeOffset: -1 * LAST_VIEWPORT_START,
                            cursor: pc + 1,
                        }
                    }
                    else if (pc >= UPPER_PADDING_BOUNDARY) {
                        // EDGE, scroll board
                        return {
                            absolute: pa + 1,
                            rangeOffset: pb - 1,
                            cursor: pc,
                        }
                    }
                    else {
                        // scroll cursor
                        return {
                            absolute: pa + 1,
                            rangeOffset: pb,
                            cursor: pc + 1,
                        }
                    }
                }
                case '-':
                {
                    if (pa <= FIRST_ABSOLUTE) {
                        // don't move
                        return {
                            absolute: FIRST_ABSOLUTE,
                            rangeOffset: FIRST_ABSOLUTE,
                            cursor: FIRST_ABSOLUTE,
                        }
                    }
                    else if (pa <= FIRST_PADDING) {
                        // MAX, scroll cursor
                        return {
                            absolute: pa - 1,
                            rangeOffset: FIRST_ABSOLUTE,
                            cursor: pa - 1,
                        }
                    }
                    else if (pc < LOWER_PADDING_BOUNDARY) {
                        // EDGE, scroll board
                        return {
                            absolute: pa - 1,
                            rangeOffset: pb + 1,
                            cursor: pc,
                        }
                    }
                    else {
                        // scroll cursor
                        return {
                            absolute: pa - 1,
                            rangeOffset: pb,
                            cursor: pc - 1,
                        }
                    }
                }
                case '++':
                {
                    if (pa >= LAST_VIEWPORT_START) {
                        // SET TO ABSOLUTE LAST
                        return {
                            absolute: boardRange - 1,
                            rangeOffset: -1 * (boardRange - viewportRange),
                            cursor: viewportRange - 1,
                        }
                    }
                    else if (pa >= SECOND_LAST_VIEWPORT) {
                        return {
                            absolute: boardRange - (viewportRange - pc),
                            rangeOffset: -1 * (boardRange - viewportRange),
                            cursor: pc,
                        }
                    }
                    else {
                        // JUST SCROLL BOARD
                        return {
                            absolute: pa + viewportRange,
                            rangeOffset: pb - viewportRange,
                            cursor: pc,
                        }
                    }
                }
                case '--':
                {
                    if (pa <= FIRST_VIEWPORT_END) {
                        return {
                            absolute: 0,
                            rangeOffset: 0,
                            cursor: 0,
                        }
                    }
                    else if (pa <= SECOND_VIEWPORT) {
                        return {
                            absolute: pa + pb,
                            rangeOffset: 0,
                            cursor: pa + pb,
                        }
                    }
                    else {
                        return {
                            absolute: pa - viewportRange,
                            rangeOffset: pb + viewportRange,
                            cursor: pc,
                        }
                    }
                }
                default:
                    console.log('wat');
                    return {
                        absolute: 0,
                        rangeOffset: 0,
                        cursor: 0,
                    }
            }
        },

        // RENDER
        render: function (screen) {
            var $list = $('#jira-credits-list');
            var $game = $('#jira-credits-game');
            var $home = $('#jira-credits-home');

            $list.css('display', 'none');
            $game.css('display', 'none');
            $home.css('display', 'none');
            Credits.List.deinit();
            Credits.Game.deinit();
            Credits.Home.deinit();

            switch (screen) {
                case Credits.SCREEN.LIST:
                    Credits.List.init();
                    $list.css('display', 'inline-block');
                    Credits.play('turnOn');
                    return;
                case Credits.SCREEN.GAME:
                    Credits.Game.init();
                    $game.css('display', 'inline-block');
                    Credits.play('turnOn');
                    return;
                default:
                    Credits.Home.init();
                    $home.css('display', 'inline-block');
                    Credits.play('turnOff');
                    return;
            }
        },
    };

    Credits.SCREEN = {
        HOME: 'home',
        LIST: 'list',
        GAME: 'game',
    };

    Credits.Data = {
        contributorBlob: contributorBlob,
        pad: function(n) {
            var width = 4;
            var strN = n + '';
            if (strN.length >= width) {
                return n;
            } else {
                return new Array(width - strN.length + 1).join('0') + strN;
            }
        },

        offsetPos: function(pos) {
            return {
                x: Math.floor((pos.x*2) / TILE_SIZE),
                y: Math.floor((pos.y*2) / TILE_SIZE)
            }
        }
    };

    var TILE_SIZE = 32;
    var VIEWPORT_BOUNDS = {
        width: 32,
        height: 14,
    };
    var BOARD_BOUNDS = {
        width: 92,
        height: 92,
    };
    var VIEWPORT_PADDING = {
        VERTICAL: 5,
        HORIZONTAL: 6,
    };
    var DIRECTION = {
        UP: 'up',
        DOWN: 'down',
        LEFT: 'left',
        RIGHT: 'right',
    };

    Credits.Data.coords = {};
    Credits.Data.contributorIds = [];
    for (var key in Credits.Data.contributorBlob) {
        if (Credits.Data.contributorBlob.hasOwnProperty(key)) {
            var c = Credits.Data.contributorBlob[key];
            var pos = Credits.Data.offsetPos(c);
            Credits.Data.coords[Credits.Data.pad(pos.x) + Credits.Data.pad(pos.y)] = key;
            if (c["name"] != "???") {
                Credits.Data.contributorIds.push(key);
            }
        }
    }
    Credits.Data.contributorIds.sort();

    Credits.Home = {
        // CONSTANTS
        keybindKey: 'keydown.credits.home',
        clickbindKey: 'click.credits.home',

        // STATE
        selected: Credits.SCREEN.GAME,

        // LIFE CYCLE
        init: function(){
            Credits.Home.addKeyBindings();
            Credits.Home.addClickBindings();
            Credits.Home.render();
        },
        deinit: function(){
            $(document)
                .unbind(Credits.Home.keybindKey)
                .unbind(Credits.Home.clickbindKey);
        },

        // HELPERS
        addKeyBindings: function() {
            function bindHotKey(f) {
                return function (key) {
                    $(document).on(Credits.Home.keybindKey, null, key, function (e) {
                        e.preventDefault();
                        f();
                    });
                }
            }
            ['up', 'down', 'w', 's'].forEach(
                bindHotKey(function() {
                    Credits.Home.selected = (Credits.Home.selected === Credits.SCREEN.GAME) ? Credits.SCREEN.LIST : Credits.SCREEN.GAME;
                    Credits.Home.render();
                    Credits.play('select2');
                })
            );
            ['return', 'space'].forEach(
                bindHotKey(function() {
                    Credits.render(Credits.Home.selected);
                })
            );
        },

        addClickBindings: function() {
            function clickHandler(selector, screen) {
                $(document).on(Credits.Home.clickbindKey, selector, function() {
                    Credits.Home.selected = screen;
                    Credits.Home.render();
                    Credits.render(screen);
                })
            }
            clickHandler('#jira-credits-home-button-game', Credits.SCREEN.GAME);
            clickHandler('#jira-credits-home-button-list', Credits.SCREEN.LIST);
        },

        // RENDER
        render: function() {
            var $game = $('#jira-credits-home-button-game');
            var $list = $('#jira-credits-home-button-list');
            var selectedClass = 'jira-credits-row-item-selected';
            switch (Credits.Home.selected) {
                case Credits.SCREEN.GAME:
                    $game.addClass(selectedClass);
                    $list.removeClass(selectedClass);
                    return;
                case Credits.SCREEN.LIST:
                    $game.removeClass(selectedClass);
                    $list.addClass(selectedClass);
                    return;
                default:
                    $game.removeClass(selectedClass);
                    $list.removeClass(selectedClass);
                    return;
            }
        }
    };

    Credits.Game = {
        // CONSTANTS
        keybindKey: 'keydown.credits.game',
        clickbindKey: 'click.credits.game',
        mousemoveBindKey: 'mousemove.credits.game',

        // STATE
        absolutePoint:{
            x: undefined,
            y: undefined,
        },
        boardPoint: {
            x: undefined,
            y: undefined,
        },
        cursorPoint: {
            x: undefined,
            y: undefined,
        },

        // LIFE CYCLE
        init: function() {
            $('#jira-credits-board')
                .css('width', (BOARD_BOUNDS.width * TILE_SIZE)+'px')
                .css('height', (BOARD_BOUNDS.height * TILE_SIZE)+'px');

            Credits.Game.addKeyBindings();
            Credits.Game.addMouseBinding();

            if (Credits.Game.absolutePoint.x === undefined) {
                Credits.Game.setAbsolutePosition(BOARD_BOUNDS.width / 2, BOARD_BOUNDS.height / 2);
            }
        },
        deinit: function() {
            $(document)
                .unbind(Credits.Game.keybindKey)
                .unbind(Credits.Game.mousemoveBindKey);
        },

        addKeyBindings: function() {
            var $document = $(document);

            function addHotKey(key, action) {
                $document.on(Credits.Game.keybindKey, null, key, function(e) {
                    Credits.Game.triggerHandler(e, action);
                });
            }
            var keymap = {
                'up': DIRECTION.UP,
                'down': DIRECTION.DOWN,
                'left': DIRECTION.LEFT,
                'right': DIRECTION.RIGHT,
                'w': DIRECTION.UP,
                's': DIRECTION.DOWN,
                'a': DIRECTION.LEFT,
                'd': DIRECTION.RIGHT,
            };
            for (var key in keymap) {
                if (keymap.hasOwnProperty(key)) {
                    addHotKey(key, keymap[key]);
                }
            }

            ['l'].forEach(function(key) {
                $document.on(Credits.Game.keybindKey, null, key, function () {
                    Credits.render(Credits.SCREEN.LIST);
                });
            });

            ['q'].forEach(function(key){
                $document.on(Credits.Game.keybindKey, null, key, function () {
                    Credits.render(Credits.SCREEN.HOME);
                });
            });
        },

        addMouseBinding: function() {
            $('#jira-credits-board-container').on(Credits.Game.mousemoveBindKey, function(e){
                var mouseX = e.pageX - this.offsetParent.offsetParent.offsetLeft;
                var mouseY = e.pageY - this.offsetTop - this.offsetParent.offsetParent.offsetTop;
                var mousePoint = {
                    x: Math.floor(mouseX/TILE_SIZE) - Credits.Game.boardPoint.x,
                    y: Math.floor(mouseY/TILE_SIZE) - Credits.Game.boardPoint.y - 2,
                };
//                        console.log("X: " + mousePoint.x + " Y: " + mousePoint.y);
                var contributor = Credits.Game.getContributor(mousePoint) || Credits.Game.getContributor(Credits.Game.absolutePoint);
                Credits.Game.renderContributor(contributor);
            });

            $(document).on(Credits.Game.clickbindKey, '.jira-credits-back-button', function() {
                Credits.render(Credits.SCREEN.HOME);
            });
        },

        // HELPERS
        triggerHandler: function(e, action) {
            e.preventDefault();
            Credits.Game.scrollInDirection(action);
        },

        setAbsolutePosition: function(x, y) {
            if (x >= BOARD_BOUNDS.width - 1) {
                x = BOARD_BOUNDS.width - 1;
            }
            if (y >= BOARD_BOUNDS.height - 1) {
                y = BOARD_BOUNDS.height - 1;
            }

            Credits.Game.absolutePoint.x = x;
            Credits.Game.absolutePoint.y = y;


            if (x < VIEWPORT_BOUNDS.width / 2) {
                Credits.Game.boardPoint.x = 0;
                Credits.Game.cursorPoint.x = x;
            }
            else if (x > (BOARD_BOUNDS.width - VIEWPORT_BOUNDS.width / 2)) {
                Credits.Game.boardPoint.x = -1 * (BOARD_BOUNDS.width - VIEWPORT_BOUNDS.width);
                Credits.Game.cursorPoint.x = x + Credits.Game.boardPoint.x;
            }
            else {
                Credits.Game.boardPoint.x = -1 * (x - VIEWPORT_BOUNDS.width / 2);
                Credits.Game.cursorPoint.x = VIEWPORT_BOUNDS.width / 2;
            }

            if (y < VIEWPORT_BOUNDS.height / 2) {
                Credits.Game.boardPoint.y = 0;
                Credits.Game.cursorPoint.y = y;
            }
            else if (y > (BOARD_BOUNDS.height - VIEWPORT_BOUNDS.height / 2)) {
                Credits.Game.boardPoint.y = -1 * (BOARD_BOUNDS.height - VIEWPORT_BOUNDS.height);
                Credits.Game.cursorPoint.y = y + Credits.Game.boardPoint.y;
            }
            else {
                Credits.Game.boardPoint.y = -1 * (y - VIEWPORT_BOUNDS.height / 2);
                Credits.Game.cursorPoint.y = VIEWPORT_BOUNDS.height / 2;
            }

            Credits.Game.render()
        },

        goToUser: function(username) {
            return function() {
                var myCoord = Credits.Data.offsetPos(Credits.Data.contributorBlob[username]);
//                        console.log("goToUser", username, Credits.Data.contributorBlob[username], myCoord);
                Credits.Game.setAbsolutePosition(myCoord.x, myCoord.y);
            }
        },

        scrollInDirection: function(direction) {
            Credits.play('select2');

            if (
                direction === DIRECTION.LEFT ||
                direction === DIRECTION.RIGHT
            ) {
                var stateX = Credits.calcScrollingState(
                    (direction === DIRECTION.LEFT) ? '-' : '+',
                    Credits.Game.absolutePoint.x,
                    Credits.Game.boardPoint.x,
                    Credits.Game.cursorPoint.x,
                    VIEWPORT_PADDING.HORIZONTAL,
                    VIEWPORT_BOUNDS.width,
                    BOARD_BOUNDS.width
                );
                Credits.Game.absolutePoint.x = stateX.absolute;
                Credits.Game.boardPoint.x = stateX.rangeOffset;
                Credits.Game.cursorPoint.x = stateX.cursor;
            }

            else if (
                direction === DIRECTION.UP ||
                direction === DIRECTION.DOWN
            ) {
                var stateY = Credits.calcScrollingState(
                    (direction === DIRECTION.UP) ? '-' : '+',
                    Credits.Game.absolutePoint.y,
                    Credits.Game.boardPoint.y,
                    Credits.Game.cursorPoint.y,
                    VIEWPORT_PADDING.VERTICAL,
                    VIEWPORT_BOUNDS.height,
                    BOARD_BOUNDS.height
                );
                Credits.Game.absolutePoint.y = stateY.absolute;
                Credits.Game.boardPoint.y = stateY.rangeOffset;
                Credits.Game.cursorPoint.y = stateY.cursor;
            }

            Credits.Game.render();
        },

        getContributor: function(absolutePoint) {
            var strX = Credits.Data.pad(absolutePoint.x);
            var strY = Credits.Data.pad(absolutePoint.y);
            var coordsKey = strX + strY;
            var contributor = Credits.Data.coords[coordsKey];
//                    console.log("getContributor:", strX, strY, contributor, Credits.Data.contributorBlob[contributor]);
            return Credits.Data.contributorBlob[contributor];
        },

        // RENDER
        render: function() {
//                    console.log('rendering...', Credits.Game.absolutePoint.x, Credits.Game.absolutePoint.y)

            Credits.Game.renderOffset('#jira-credits-board',
                Credits.Game.boardPoint.x * TILE_SIZE,
                Credits.Game.boardPoint.y * TILE_SIZE);
            Credits.Game.renderOffset('#jira-credits-cursor',
                Credits.Game.cursorPoint.x * TILE_SIZE,
                Credits.Game.cursorPoint.y * TILE_SIZE);

            var contributor = Credits.Game.getContributor(Credits.Game.absolutePoint);
            Credits.Game.renderContributor(contributor);
        },

        renderOffset: function(selector, x, y) {
            var translate = ['translate(', x, 'px,', y, 'px)'].join('');
            $(selector).css('transform', translate);
        },

        renderContributor: function(con) {
            if (con) {
                $('#jira-credits-name').html(con.name + ' - ');
                $('#jira-credits-desc').html(con.role);
                //$('#jira-credits-hud').show();
            } else {
                $('#jira-credits-name').html('');
                $('#jira-credits-desc').html('');
                $('#jira-credits-level').html('');
                //$('#jira-credits-hud').hide();
            }
        },
    };

    Credits.List = {
        // CONSTANTS
        keybindKey: 'keydown.credits.list',
        clickbindKey: 'click.credits.list',
        viewportRange: 8,
        scrollPadding: 2,

        // STATE
        absolute: 0,
        rangeOffset: 0,
        cursor: 0,

        // LIFE CYCLE
        init: function(){
            Credits.List.addKeyBindings();
            Credits.List.render();
        },
        deinit: function(){
            $(document)
                .unbind(Credits.List.keybindKey)
                .unbind(Credits.List.clickbindKey);
        },

        // HELPERS
        addKeyBindings: function() {
            var $document = $(document);

            function bindHotKey(f) {
                return function (key) {
                    $document.on(Credits.List.keybindKey, null, key, function (e) {
                        e.preventDefault();
                        f();
                    });
                }
            }

            // SCROLL
            function bindCalcScroll(direction) {
                return bindHotKey(function() {
                    var state = Credits.calcScrollingState(
                        direction,
                        Credits.List.absolute,
                        Credits.List.rangeOffset,
                        Credits.List.cursor,
                        Credits.List.scrollPadding,
                        Credits.List.viewportRange,
                        Credits.Data.contributorIds.length
                    );

                    if (Credits.List.absolute === state.absolute) {
                        // don't play sound
                    } else {
                        Credits.play('select2');
                    }

                    Credits.List.absolute = state.absolute;
                    Credits.List.rangeOffset = state.rangeOffset;
                    Credits.List.cursor = state.cursor;

                    Credits.List.render();
                })
            }

            ['up', 'w'].forEach(bindCalcScroll('-'));
            ['down', 's'].forEach(bindCalcScroll('+'));
            ['pageup'].forEach(bindCalcScroll('--'));
            ['pagedown'].forEach(bindCalcScroll('++'));

            // GO TO
            function goToGameWithIndex(i) {
                var contributorId = Credits.Data.contributorIds[i];
                var contributor = Credits.Data.contributorBlob[contributorId];
                var pos = Credits.Data.offsetPos(contributor);
//                        console.log("goToGameWithIndex", pos, i);
                Credits.render(Credits.SCREEN.GAME);
                Credits.Game.setAbsolutePosition(pos.x, pos.y);
            }
            ['return', 'space'].forEach(
                bindHotKey(function() {
                    var i = Credits.List.cursor - Credits.List.rangeOffset;
                    goToGameWithIndex(i);
                })
            );
            $document.on(Credits.List.clickbindKey, '.jira-credits-list-row-item', function() {
                var i = $(this).data('row-index');
                goToGameWithIndex(i);
            });
            $document.on(Credits.List.clickbindKey, '.jira-credits-back-button', function() {
                Credits.render(Credits.SCREEN.HOME);
            });

            // NAVIGATION
            ['q'].forEach(function(key){
                $(document).on(Credits.List.keybindKey, null, key, function () {
                    Credits.render(Credits.SCREEN.HOME);
                });
            });
        },

        // RENDER
        render: function() {
            //console.log(Credits.List.absolute, Credits.List.rangeOffset, Credits.List.cursor);
            var rows = [
                '<tr>',
                '<th></th>',
                '<th>Name</th>',
                '<th>Role</th>',
                '</tr>'
            ];
            var start = 0 - Credits.List.rangeOffset;
            var end = Credits.List.viewportRange - Credits.List.rangeOffset;
            for (var i = start; i < end; i++) {
                var contributorId = Credits.Data.contributorIds[i];
                var contributor = Credits.Data.contributorBlob[contributorId];
                if (contributor === undefined) { break; }
                rows.push('<tr data-row-index="'+i+'" class="jira-credits-list-row-item jira-credits-row-item jira-credits-clickable');
                if (i === Credits.List.cursor - Credits.List.rangeOffset) {
                    rows.push(' jira-credits-row-item-selected');
                }
                rows.push('">',
                    '<td class="jira-credits-arrow"><img src="'+properties.cursorURL+'" alt="select"></td>',
                    '<td>', contributor.name, '</td>',
                    '<td>', contributor.role, '</td>',
                    '</tr>');
            }
            $('#jira-credits-list-rows').html(rows.join(''));
        }
    };

    Credits.Sound = properties.sounds;

    return Credits;
});
