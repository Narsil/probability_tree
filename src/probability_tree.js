(function($) {
    // Default options
    var defaults = {
        data: {
            E1:{value:'...'},
            E2:{value:'...'}
        },
        probability_editable: true,
        events_editable: false,
        tree_editable: false,
        intersection_editable: false
        
    };
    // Name of the classes in the DOM
    var classes = {
        main_container: 'probability_tree_container',
        intersection: 'probability_intersection',
        probability_tree: 'probability_tree_probability'
    };

    // Global of all the trees created (useful to get data back)
    var trees = {};
    // Global id increment
    var id = 0;


    
    probability_treeClass = function(el, options){


        //////////// TREE Management ///////////////////
        var get_depth = function(data){
            var depth = 0;
            $.each(data, function(key, obj){
                if (key == 'value' || key == 'intersection'){
                    return true;
                }
                var d = 1 + get_depth(obj);
                if (d > depth){
                    depth =d;
                }
            });
            return depth;
        };
        var get_height = function(data){
            var height = 0;
            var num_keys = 0;
            $.each(data, function(key, obj){
                if (key == 'value' || key == 'intersection'){
                    return true;
                }
                num_keys += 1;
                height += get_height(obj);
            });
            if (num_keys === 0){
                height = 1;
            }
            return height;
        };

        var rework_data = function(data){
            var list = [];
            $.each(data, function(key, obj){
                if (key == 'value' || key == 'intersection'){
                    return true;
                }
                var value;
                value = obj.value;
                if (value === undefined){
                    value = obj;
                }
                var intersection = obj.intersection;
                list.push( [key, get_height(obj), rework_data(obj), value, intersection] );
            });
            return list;
        };
        var prepare_focus = function(math){
            math.find('textarea').focus(function(){
                var cursor = $(this).closest('.mathquill-editable').mathquill('cursor');
                cursor.insAtLeftEnd(cursor.root);
                while (cursor[1]){
                    cursor.selectRight();
                }
            });
        };

        //////////// TREE Drawing ///////////////////
        var draw_tree = function(tree, current_row, root_index, path){
            if (current_row === undefined){
                current_row = $('<tr></tr>');
            }
            if (root_index === undefined){
                root_index = '';
            }
            if (path === undefined){
                path = [];
            }
            var rows = [];
            var options = this.options;
            var that = this;
            $.each(tree, function(index, obj){
                var name = obj[0];
                var local_path = path.slice();
                local_path.push(name);
                var height = obj[1];
                var subtree = obj[2];
                var intersection = obj[4];
                var local_index = root_index.toString() + index;
                var span = $('<span></span>')
                        .text(name)
                        .mathquill(!options.events_editable || 'editable')
                        .attr('id', get_id(local_index));

                if (options.events_editable){
                    span.find('textarea').blur(function(e){
                        that.save_event(local_path, $(this).closest('.mathquill-editable').mathquill('latex'));
                    });
                    prepare_focus(span);
                }
                var div = $('<div></div>').append(span);
                var cell = $('<td></td>')
                    .append(div)
                    .attr('rowspan', height);
                if (options.tree_editable){
                    var buttons = $('<span></span>');
                    var add_button = $('<button></button>').text('+');
                    setup_add_button(that, add_button, local_path);
                    var remove_button = $('<button></button>').text('-');
                    setup_remove_button(that, remove_button, local_path);
                    buttons.append(remove_button);
                    buttons.append(add_button);
                    div.append(buttons);
                }
                current_row.append(cell);
                if (subtree.length === 0 && (intersection !== undefined || options.intersection_editable)){
                    intersection_div = $('<span></span>')
                        .text('P\\left('  + local_path.join(' \\cap ') + '\\right) = ')
                        .mathquill();
                    value_div = $('<span></span>').
                        text(intersection || '...')
                        .mathquill(!options.intersection_editable || 'editable');
                    value_div.find('textarea').blur(function(){
                        that.save_intersection(local_path, $(this).closest('.mathquill-editable').mathquill('latex'));
                    });
                    prepare_focus(value_div);
                    cell = $('<td></td>')
                        .append(intersection_div, value_div)
                        .attr('rowspan', height)
                        .addClass(classes.intersection);
                    current_row.append(cell);
                }
                if (subtree.length !== 0){
                    var subtree_table = draw_tree.call(that, subtree, current_row, local_index, local_path);
                    $.each(subtree_table, function(index, obj){
                        rows.push(obj);
                        current_row = $('<tr></tr>');
                    });
                }else{
                    rows.push(current_row);
                    current_row = $('<tr></tr>');
                }

            });
            return rows;
        };

        var get_id = function(name){
            if (name === undefined){
                name = id;
            }
            return 'tree-' + name;
        };

        var draw_graph_lines = function(paper, data, root_name, path){
            if (root_name === undefined){
                root_name = '';
            }
            if (path === undefined){
                path = [];
            }
            var that = this;
            $.each(data, function(index, obj){
                name = root_name + index;
                // Cloning
                var local_path = $.extend(true, [], path);
                local_path.push(obj[0]);
                draw_line.call(that, paper, root_name, name, obj[3], local_path);
                draw_graph_lines.call(that, paper, obj[2], name, local_path);
            });
        };

        var draw_line = function(paper, name1, name2, label, local_path){
            var par= $(paper.canvas).parent();
            var that = this;
            if(name1 !== ''){
                var id1 = get_id(name1);
                var el1 = par.find('#' + id1);
                x1 = el1.position().left + el1.innerWidth();
                y1 = el1.position().top + el1.innerHeight()/2;
            }else{
                x1 = 0;
                y1 = paper.canvas.offsetHeight/2;
            }

            var id2 = get_id(name2);
            var el2 = par.find('#' + id2);
            x2 = el2.position().left;
            y2 = el2.position().top + el2.innerHeight()/2;
            
            var vec = [x2 - x1, y2 - y1];
            
            x1 += 0.1 * vec[0];
            x2 -= 0.05 * vec[0];
            y1 += 0.1 * vec[1];
            y2 -= 0.05 * vec[1];

            paper.path('M'+ x1 + ' ' + y1 + 'L' + x2 + ' ' + y2);
            if (label !== undefined){
                xt = (x2 + x1)/2;
                yt = (y2 + y1)/2;
                delta = 8;
                if (y2 > y1){
                    yt += delta;
                }else{
                    yt -= delta;
                }
                //xt += delta;
                var div = $('<div></div>')
                    .text(label)
                    .addClass(classes.probability_tree)
                    .mathquill(!this.options.probability_editable || 'editable');

                if (options.probability_editable){
                    div.find('textarea').blur(function(e){
                        that.save_tree(local_path, $(this).closest('.mathquill-editable').mathquill('latex'));
                    });
                    prepare_focus(div);
                }
                par.append(div);
                yt -= div.height()/2;
                xt -= div.width()/2;
                // xt = 0;
                // yt = 0;
                div.css({'top': yt, 'left':xt});
            }

        };



        //////////// INIT ///////////////////
        this.el = $('<div></div>')
            .attr('id', get_id(el.attr('id')))
            .addClass(classes.main_container);
        el.append(this.el);

        this.options = options;

        

        //////////// RENDER ///////////////////
        this.render = function(){
            var data = this.options.data;
            var editable = this.options.editable;

            var depth = get_depth(data);
            var tree_height = get_height(data);

            var table = $('<table></table>');
            var reworked_data = rework_data(data);
            var rows = draw_tree.call(this, reworked_data);
            $.each(rows, function(index, row){
                table.append(row);
            });

            this.el.html(table);
            this.paper = Raphael(this.el.attr('id'));
            var paper = this.paper;
            paper.canvas.style.position='absolute';
            paper.canvas.style.top=0;
            paper.canvas.style.left=0;
            paper.canvas.style.zIndex= table.css('z-index') - 1;
            
            var height = el.height() || this.el.height();
            paper.canvas.style.height=height + 'px';

            var width = this.el.width();
            var that = this;
            // Need timeout so mathquill rendering can take effect and
            // raphael won't be off.
            setTimeout(function(){
                paper.clear();
                el.find('.' +classes.probability_tree).remove();
                // Hack around `this` in setTimeout
                draw_graph_lines.call(that, paper, reworked_data);
            }, 100);
            setTimeout(function(){
                paper.clear();
                el.find('.' + classes.probability_tree).remove();
                // Hack around `this` in setTimeout
                draw_graph_lines.call(that, paper, reworked_data);
            }, 1000);

            if (this.options.tree_editable){
                var add_button = $('<button></button>')
                    .text('+')
                    .addClass(classes.main_add_button);
                setup_add_button(this, add_button, []);
                table.append(add_button);

                add_button.css({
                    'position': 'absolute',
                    'top': height/2 - add_button.height() /2,
                    'left': 0,
                    'padding': 0
                });
            }
            table.css({
                'height': height + 'px'
            });

            el.addClass('rendered');
        };


        //////////// SAVING DATA ///////////////////
        var setup_add_button = function(that, add_button, local_path){
            add_button.click(function(){
                var target_data = options.data;
                for (i = 0; i < local_path.length; i++){
                    target_data = target_data[local_path[i]];
                }
                var start = 'E';
                var key;
                for (i = 1; i < 100; i++){
                    key = start + i;
                    if (!target_data.hasOwnProperty(key)){
                        break; 
                    }
                }
                var new_data = {};
                new_data[key] = {value: '...'};
                target_data = $.extend(target_data, new_data);
                that.render();
                that.el.trigger('modified');
            });
        };
        var setup_remove_button = function(that, button, local_path){
            button.click(function(){
                var target_data = that.options.data;
                var i;
                for (i = 0; i < local_path.length - 1; i++){
                    target_data = target_data[local_path[i]];
                }
                delete target_data[local_path[local_path.length - 1]];
                that.render();
                that.el.trigger('modified');
            });
        };
        this.save_event = function(local_path, new_event){
            var prev_data = this.options.data;
            var i;
            for ( i=0; i<local_path.length - 1; i++){
                prev_data = prev_data[local_path[i]];
            }
            var old_key = local_path[local_path.length - 1];
            if (new_event !== old_key){
                prev_data[new_event] = prev_data[old_key];
                delete prev_data[old_key];
            }
            this.el.trigger('modified');
            this.render();
        };
        this.save_tree = function(local_path, new_value){
            var prev_data = this.options.data;
            var i;
            for ( i=0; i<local_path.length; i++){
                prev_data = prev_data[local_path[i]];
            }
            prev_data.value = new_value;
            this.el.trigger('modified');
        };

        this.save_intersection = function(local_path, new_value){
            var prev_data = this.options.data;
            var i;
            for ( i=0; i<local_path.length; i++){
                prev_data = prev_data[local_path[i]];
            }
            prev_data.intersection = new_value;
            this.el.trigger('modified');
        };
    };  
    /////////////////  END OF CLASS ////////////////////////////

    function isBlank(str) {
        return (!str || /^\s*$/.test(str));
    }
    $.fn.probability_tree = function(arg) {
        if (arg === 'data'){
            var el = this.first();
            var _id = el.attr('tree-id');
            return trees[_id].options.data;
        }

        var options = $.extend({}, defaults, arg);

        return this.each( function(){
            if ($(this).hasClass('rendered')){
                return;
            }
            if (!isBlank($(this).text())){
                try{
                    options.data = $.extend(options.data, $.parseJSON($(this).text()));
                }catch(e){
                    console.log(e);
                }
            }
            var tree = new probability_treeClass($(this), options);
            trees[_id] = tree;
            $(this).attr('tree-id', id);
            id++;
            tree.render();
            

        });
    };
    $.probability_tree_init = function() {
        $('.probability_tree:not(.editable)').probability_tree({tree_editable:false});
        $('.probability_tree.editable').probability_tree({tree_editable:true, event_editable:true, intersection_editable:true});
    };

}(jQuery));
