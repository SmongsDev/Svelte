
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.55.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/header.svelte generated by Svelte v3.55.1 */

    const file$6 = "src/header.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*m*/ ctx[0].x + "";
    	let t1;
    	let t2;
    	let br;
    	let t3;
    	let t4_value = /*m*/ ctx[0].y + "";
    	let t4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("x 좌표 : ");
    			t1 = text(t1_value);
    			t2 = space();
    			br = element("br");
    			t3 = text("\n  y 좌표 : ");
    			t4 = text(t4_value);
    			add_location(br, file$6, 6, 2, 126);
    			attr_dev(div, "class", "svelte-o0n5qp");
    			add_location(div, file$6, 4, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, br);
    			append_dev(div, t3);
    			append_dev(div, t4);

    			if (!mounted) {
    				dispose = listen_dev(div, "mousemove", /*mousemove_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*m*/ 1 && t1_value !== (t1_value = /*m*/ ctx[0].x + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*m*/ 1 && t4_value !== (t4_value = /*m*/ ctx[0].y + "")) set_data_dev(t4, t4_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let m = { x: 0, y: 0 };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const mousemove_handler = e => $$invalidate(0, m = { x: e.clientX, y: e.clientY });
    	$$self.$capture_state = () => ({ m });

    	$$self.$inject_state = $$props => {
    		if ('m' in $$props) $$invalidate(0, m = $$props.m);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [m, mousemove_handler];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/footer.svelte generated by Svelte v3.55.1 */

    const file$5 = "src/footer.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (54:0) {#each btss as bts}
    function create_each_block$2(ctx) {
    	let h30;
    	let img;
    	let img_src_value;
    	let t0;
    	let h31;
    	let t1;
    	let t2_value = /*bts*/ ctx[2].name + "";
    	let t2;
    	let t3;
    	let h32;
    	let t4;
    	let t5_value = /*bts*/ ctx[2].birth + "";
    	let t5;
    	let t6;
    	let hr;

    	const block = {
    		c: function create() {
    			h30 = element("h3");
    			img = element("img");
    			t0 = space();
    			h31 = element("h3");
    			t1 = text("이름 : ");
    			t2 = text(t2_value);
    			t3 = space();
    			h32 = element("h3");
    			t4 = text("출생 : ");
    			t5 = text(t5_value);
    			t6 = space();
    			hr = element("hr");
    			if (!src_url_equal(img.src, img_src_value = /*bts*/ ctx[2].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$5, 54, 4, 2560);
    			add_location(h30, file$5, 54, 0, 2556);
    			add_location(h31, file$5, 55, 0, 2594);
    			add_location(h32, file$5, 56, 0, 2621);
    			add_location(hr, file$5, 57, 0, 2649);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h30, anchor);
    			append_dev(h30, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h31, anchor);
    			append_dev(h31, t1);
    			append_dev(h31, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, h32, anchor);
    			append_dev(h32, t4);
    			append_dev(h32, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, hr, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*btss*/ 1 && !src_url_equal(img.src, img_src_value = /*bts*/ ctx[2].img)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*btss*/ 1 && t2_value !== (t2_value = /*bts*/ ctx[2].name + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*btss*/ 1 && t5_value !== (t5_value = /*bts*/ ctx[2].birth + "")) set_data_dev(t5, t5_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(h32);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(54:0) {#each btss as bts}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let button;
    	let t1;
    	let each_1_anchor;
    	let mounted;
    	let dispose;
    	let each_value = /*btss*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "멤버삭제";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			add_location(button, file$5, 51, 0, 2489);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*deleteMember*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*btss*/ 1) {
    				each_value = /*btss*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);

    	let btss = [
    		{
    			id: 1,
    			name: 'RM(김남준)',
    			birth: 1994,
    			img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2Fbbd9629ef96c284dfca79eb3b26d49e49ba24b78117abba76b3108cd2b5b8b2860f4d7ceeaef314116b608d5b9d7b080d7e7751e385cc03988992088f8b932b5280a1d1075b1c5bd4759e679166564ca9a95b4ca0bdbdaa219462eacbcbd37be&type=fff264_180'
    		},
    		{
    			id: 2,
    			name: '진(김석진)',
    			birth: 1992,
    			img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2F8152fad7a07738b7d11b8fe1b44b3cd0db34d5fa5c35abee4deae2fd163a4218f003e753532e1edd20a4db12e88382c0f3342d054cba5a0d38ba8bd9be593138ae4b6404caf7373e92540f2688467b825caa89de860dccc282395d440f6f72db&type=fff264_180'
    		},
    		{
    			id: 3,
    			name: '슈가(민윤기)',
    			birth: 1993,
    			img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2Ff4f55ac286d2de6ead4dcf4ab419ca0ba3c44e3badcffe171f727d2653d9dce70d3a2a016307c21a9345fe53c74f099657bc5c96006acc61dc32eecff8e197818ed47d31fbfffc2e17654634345a357017536656b0258d7d1b26ee6b687095b4&type=fff264_180'
    		},
    		{
    			id: 4,
    			name: '제이홉(정호석)',
    			birth: 1994,
    			img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2F67b1d265064ef6fce5ff59b3cf9195e64afade8493633cbf57087c55d40655c08a9481278bf960455ab4ea434bc3c250d57333d6c48743124de4c20d359684728713f1d0b8b063bc510feece8729186146cdbdba6cba15864bc4582aeebce6d5&type=fff264_180'
    		},
    		{
    			id: 5,
    			name: '지민(박지민)',
    			birth: 1995,
    			img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2F379e369eeb01b0fff2ee569d236747e80764442246f1e00bdbc34f658e04847956c3e323a151ebd6f9306aa2214d3f4b5a7ee7142629a1fc727c0ece80642b8d1774fd7f36f2e7fb997cbc7c8f9e135c80e06dd63905e3d4b0de5b1a4a6e143d&type=fff264_180'
    		},
    		{
    			id: 6,
    			name: '뷔(김태형)',
    			birth: 1995,
    			img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2F6e0bcfbe998a033312f0bf704f9880b48048bd960bacafe27ddc7080a9f3149e15ff59e4182c0436b95eed13012fc28c6d0219557cec1f7f9beb2438d64f36072cf50e4e513bb5ed4f3d62aba528f3b06d3edc89d5011d62961f04dc6d60fdf8&type=fff264_180'
    		},
    		{
    			id: 7,
    			name: '정국(진정국)',
    			birth: 1995,
    			img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2F7619aa7dee9b330bef6e184fdb6f8ae4bdaa49915f6cb516266b5b8a7e814e65b39931cb4baad7cffcd61927d0da0e2fa1950e3776e84a339b8c8d3ff943cc25697f4ec55a52b07869b7a2fe04fbe508b4145fc8b26dcb5d437d34e734ebefed&type=fff264_180'
    		}
    	];

    	function deleteMember() {
    		$$invalidate(0, btss = btss.slice(1));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ btss, deleteMember });

    	$$self.$inject_state = $$props => {
    		if ('btss' in $$props) $$invalidate(0, btss = $$props.btss);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [btss, deleteMember];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/main.svelte generated by Svelte v3.55.1 */

    const file$4 = "src/main.svelte";

    // (36:0) {:else}
    function create_else_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "정수로 다시 입력하세요.";
    			add_location(p, file$4, 36, 2, 604);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(36:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (34:20) 
    function create_if_block_2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "작성한 숫자는 0입니다.";
    			add_location(p, file$4, 34, 2, 573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(34:20) ",
    		ctx
    	});

    	return block;
    }

    // (32:16) 
    function create_if_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "작성한 숫자는 음수입니다.";
    			add_location(p, file$4, 32, 2, 510);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(32:16) ",
    		ctx
    	});

    	return block;
    }

    // (30:0) {#if x > 0}
    function create_if_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "작성한 숫자는 양수입니다.";
    			add_location(p, file$4, 30, 2, 469);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(30:0) {#if x > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let label;
    	let t1;
    	let input0;
    	let t2;
    	let t3;
    	let button0;
    	let t5;
    	let input1;
    	let t6;
    	let button1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*x*/ ctx[1] > 0) return create_if_block$2;
    		if (/*x*/ ctx[1] < 0) return create_if_block_1;
    		if (/*x*/ ctx[1] === '0') return create_if_block_2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			label.textContent = "양수 / 음수 테스트";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			if_block.c();
    			t3 = space();
    			button0 = element("button");
    			button0.textContent = "-";
    			t5 = space();
    			input1 = element("input");
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "+";
    			attr_dev(label, "for", "testBox");
    			add_location(label, file$4, 26, 0, 334);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "testBox");
    			attr_dev(input0, "placeholder", "정수를 입력하세요.");
    			add_location(input0, file$4, 27, 0, 375);
    			add_location(button0, file$4, 39, 0, 632);
    			attr_dev(input1, "type", "text");
    			input1.value = /*count*/ ctx[0];
    			set_style(input1, "width", "25px");
    			add_location(input1, file$4, 40, 0, 674);
    			add_location(button1, file$4, 41, 0, 731);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input0, anchor);
    			insert_dev(target, t2, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, input1, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "keyup", /*numChange*/ ctx[4], false, false, false),
    					listen_dev(button0, "click", /*minusHandle*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*plusHandle*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t3.parentNode, t3);
    				}
    			}

    			if (dirty & /*count*/ 1 && input1.value !== /*count*/ ctx[0]) {
    				prop_dev(input1, "value", /*count*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t2);
    			if_block.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(input1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Main', slots, []);
    	let count = 1;

    	function plusHandle() {
    		$$invalidate(0, count++, count);
    	}

    	function minusHandle() {
    		$$invalidate(0, count--, count);
    	}

    	let x = null;

    	function numChange(e) {
    		$$invalidate(1, x = e.target.value);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		count,
    		plusHandle,
    		minusHandle,
    		x,
    		numChange
    	});

    	$$self.$inject_state = $$props => {
    		if ('count' in $$props) $$invalidate(0, count = $$props.count);
    		if ('x' in $$props) $$invalidate(1, x = $$props.x);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*count*/ 1) {
    			if (count >= 10) {
    				alert('10개 이상 구매할 수 없음');
    				$$invalidate(0, count = 9);
    			}
    		}

    		if ($$self.$$.dirty & /*count*/ 1) {
    			if (count < 1) {
    				alert('1개 이상 구매해야 함');
    				$$invalidate(0, count = 1);
    			}
    		}
    	};

    	return [count, x, plusHandle, minusHandle, numChange];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/mainpage.svelte generated by Svelte v3.55.1 */

    function create_fragment$6(ctx) {
    	let header;
    	let t0;
    	let main;
    	let t1;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	main = new Main({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(main.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(main, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(main, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Mainpage', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Mainpage> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, Footer, Main });
    	return [];
    }

    class Mainpage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mainpage",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/product.svelte generated by Svelte v3.55.1 */

    function create_fragment$5(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Product', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Product> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Product extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Product",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/productpage.svelte generated by Svelte v3.55.1 */

    function create_fragment$4(ctx) {
    	let header;
    	let t0;
    	let product0;
    	let t1;
    	let product1;
    	let t2;
    	let product2;
    	let t3;
    	let footer;
    	let current;
    	header = new Header({ $$inline: true });
    	product0 = new Product({ $$inline: true });
    	product1 = new Product({ $$inline: true });
    	product2 = new Product({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(product0.$$.fragment);
    			t1 = space();
    			create_component(product1.$$.fragment);
    			t2 = space();
    			create_component(product2.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(product0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(product1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(product2, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(product0.$$.fragment, local);
    			transition_in(product1.$$.fragment, local);
    			transition_in(product2.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(product0.$$.fragment, local);
    			transition_out(product1.$$.fragment, local);
    			transition_out(product2.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(product0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(product1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(product2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Productpage', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Productpage> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, Footer, Product });
    	return [];
    }

    class Productpage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Productpage",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Child.svelte generated by Svelte v3.55.1 */

    const file$3 = "src/Child.svelte";

    function create_fragment$3(ctx) {
    	let h30;
    	let t0;
    	let t1;
    	let t2;
    	let h31;
    	let t3;
    	let t4;
    	let t5;
    	let h32;
    	let t6;
    	let t7;
    	let t8;
    	let hr;

    	const block = {
    		c: function create() {
    			h30 = element("h3");
    			t0 = text("이름 : ");
    			t1 = text(/*user*/ ctx[0]);
    			t2 = space();
    			h31 = element("h3");
    			t3 = text("나이 : ");
    			t4 = text(/*age*/ ctx[1]);
    			t5 = space();
    			h32 = element("h3");
    			t6 = text("취미 : ");
    			t7 = text(/*hobby*/ ctx[2]);
    			t8 = space();
    			hr = element("hr");
    			add_location(h30, file$3, 6, 0, 97);
    			add_location(h31, file$3, 7, 0, 120);
    			add_location(h32, file$3, 8, 0, 142);
    			add_location(hr, file$3, 9, 0, 167);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h30, anchor);
    			append_dev(h30, t0);
    			append_dev(h30, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, h31, anchor);
    			append_dev(h31, t3);
    			append_dev(h31, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, h32, anchor);
    			append_dev(h32, t6);
    			append_dev(h32, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, hr, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*user*/ 1) set_data_dev(t1, /*user*/ ctx[0]);
    			if (dirty & /*age*/ 2) set_data_dev(t4, /*age*/ ctx[1]);
    			if (dirty & /*hobby*/ 4) set_data_dev(t7, /*hobby*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(h32);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Child', slots, []);
    	let { user = '홍길동' } = $$props;
    	let { age = 20 } = $$props;
    	let { hobby = '독서' } = $$props;
    	const writable_props = ['user', 'age', 'hobby'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Child> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('user' in $$props) $$invalidate(0, user = $$props.user);
    		if ('age' in $$props) $$invalidate(1, age = $$props.age);
    		if ('hobby' in $$props) $$invalidate(2, hobby = $$props.hobby);
    	};

    	$$self.$capture_state = () => ({ user, age, hobby });

    	$$self.$inject_state = $$props => {
    		if ('user' in $$props) $$invalidate(0, user = $$props.user);
    		if ('age' in $$props) $$invalidate(1, age = $$props.age);
    		if ('hobby' in $$props) $$invalidate(2, hobby = $$props.hobby);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [user, age, hobby];
    }

    class Child extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { user: 0, age: 1, hobby: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Child",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get user() {
    		throw new Error("<Child>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<Child>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get age() {
    		throw new Error("<Child>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set age(value) {
    		throw new Error("<Child>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hobby() {
    		throw new Error("<Child>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hobby(value) {
    		throw new Error("<Child>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/login.svelte generated by Svelte v3.55.1 */

    const file$2 = "src/login.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (17:0) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let t1;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "로그인";
    			t1 = space();
    			p = element("p");
    			p.textContent = "현재 로그아웃상태입니다.";
    			add_location(button, file$2, 17, 2, 381);
    			add_location(p, file$2, 20, 2, 430);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggle*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(17:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (12:0) {#if user.loggedIn}
    function create_if_block$1(ctx) {
    	let button;
    	let t1;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "로그아웃";
    			t1 = space();
    			p = element("p");
    			p.textContent = "현재 로그인상태입니다.";
    			add_location(button, file$2, 12, 2, 301);
    			add_location(p, file$2, 15, 2, 351);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggle*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(12:0) {#if user.loggedIn}",
    		ctx
    	});

    	return block;
    }

    // (25:2) {#each weekdays as weekday}
    function create_each_block_1$1(ctx) {
    	let option;
    	let t0_value = /*weekday*/ ctx[7] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = text("요일");
    			option.__value = "" + (/*weekday*/ ctx[7] + "요일");
    			option.value = option.__value;
    			add_location(option, file$2, 25, 4, 501);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(25:2) {#each weekdays as weekday}",
    		ctx
    	});

    	return block;
    }

    // (31:0) {#each teams as team, i}
    function create_each_block$1(ctx) {
    	let p;
    	let t0_value = /*i*/ ctx[6] + 1 + "";
    	let t0;
    	let t1;
    	let t2_value = /*team*/ ctx[4] + "";
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = text("위 : ");
    			t2 = text(t2_value);
    			add_location(p, file$2, 31, 2, 603);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(31:0) {#each teams as team, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t0;
    	let select;
    	let t1;
    	let h3;
    	let t3;
    	let each1_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*user*/ ctx[0].loggedIn) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value_1 = /*weekdays*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*teams*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			if_block.c();
    			t0 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			h3 = element("h3");
    			h3.textContent = "2022 KBO 정규리그순워";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each1_anchor = empty();
    			add_location(select, file$2, 23, 0, 458);
    			add_location(h3, file$2, 29, 0, 551);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			}

    			if (dirty & /*weekdays*/ 4) {
    				each_value_1 = /*weekdays*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*teams*/ 8) {
    				each_value = /*teams*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each1_anchor.parentNode, each1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t3);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	let user = { loggedIn: false };

    	function toggle() {
    		$$invalidate(0, user.loggedIn = !user.loggedIn, user);
    	}

    	let weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    	let teams = [
    		'SSG 랜더스',
    		'LG 트윈스',
    		'키움 히어로즈',
    		'KT 위즈',
    		'KIA 타이거즈',
    		'NC 다이노스',
    		'삼성 라이온즈',
    		'롯데 자이언츠',
    		'두산 베어스',
    		'한화 이글스'
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ user, toggle, weekdays, teams });

    	$$self.$inject_state = $$props => {
    		if ('user' in $$props) $$invalidate(0, user = $$props.user);
    		if ('weekdays' in $$props) $$invalidate(2, weekdays = $$props.weekdays);
    		if ('teams' in $$props) $$invalidate(3, teams = $$props.teams);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [user, toggle, weekdays, teams];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/bind.svelte generated by Svelte v3.55.1 */

    const file$1 = "src/bind.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[20] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	return child_ctx;
    }

    // (29:2) {#each portals as portal}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*portal*/ ctx[21].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*portal*/ ctx[21].url;
    			option.value = option.__value;
    			add_location(option, file$1, 29, 4, 554);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(29:2) {#each portals as portal}",
    		ctx
    	});

    	return block;
    }

    // (35:0) {#each sizes as size, i}
    function create_each_block(ctx) {
    	let label;
    	let input;
    	let t0;
    	let t1_value = /*size*/ ctx[18] + "";
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(input, "type", "radio");
    			input.__value = /*i*/ ctx[20];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[11][0].push(input);
    			add_location(input, file$1, 36, 4, 686);
    			add_location(label, file$1, 35, 2, 674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = input.__value === /*choiceSize*/ ctx[4];
    			append_dev(label, t0);
    			append_dev(label, t1);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[10]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*choiceSize*/ 16) {
    				input.checked = input.__value === /*choiceSize*/ ctx[4];
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[11][0].splice(/*$$binding_groups*/ ctx[11][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(35:0) {#each sizes as size, i}",
    		ctx
    	});

    	return block;
    }

    // (65:0) {:else}
    function create_else_block(ctx) {
    	let p;
    	let t0;
    	let br;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("당신은 약관에 동의하지 않았습니다.");
    			br = element("br");
    			t1 = text("아직 구독이 불가능합니다.");
    			add_location(br, file$1, 65, 24, 1325);
    			add_location(p, file$1, 65, 2, 1303);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, br);
    			append_dev(p, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(65:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:0) {#if chk}
    function create_if_block(ctx) {
    	let p;
    	let t0;
    	let br;
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("당신은 약관에 동의했습니다.");
    			br = element("br");
    			t1 = text("이제 구독이 가능합니다.");
    			add_location(br, file$1, 63, 20, 1271);
    			add_location(p, file$1, 63, 2, 1253);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, br);
    			append_dev(p, t1);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(63:0) {#if chk}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let h30;
    	let t1;
    	let select;
    	let t2;
    	let h31;
    	let t4;
    	let t5;
    	let p0;
    	let t6;
    	let t7_value = /*sizes*/ ctx[6][/*choiceSize*/ ctx[4]] + "";
    	let t7;
    	let t8;
    	let t9;
    	let input0;
    	let t10;
    	let p1;
    	let t11;
    	let t12_value = (/*name*/ ctx[0] || '낯선 사람') + "";
    	let t12;
    	let t13;
    	let t14;
    	let label0;
    	let input1;
    	let t15;
    	let input2;
    	let t16;
    	let label1;
    	let input3;
    	let t17;
    	let input4;
    	let t18;
    	let p2;
    	let t19;
    	let t20;
    	let t21;
    	let t22;
    	let t23_value = /*a*/ ctx[1] * /*b*/ ctx[2] + "";
    	let t23;
    	let t24;
    	let label2;
    	let input5;
    	let t25;
    	let t26;
    	let t27;
    	let button;
    	let t28;
    	let button_disabled_value;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*portals*/ ctx[7];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*sizes*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*chk*/ ctx[3]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			h30 = element("h3");
    			h30.textContent = "포털 사이트 바로가기";
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			h31 = element("h3");
    			h31.textContent = "사이즈 선택";
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			p0 = element("p");
    			t6 = text("고객님은 ");
    			t7 = text(t7_value);
    			t8 = text("를 선택하셨습니다.");
    			t9 = space();
    			input0 = element("input");
    			t10 = space();
    			p1 = element("p");
    			t11 = text("안녕! ");
    			t12 = text(t12_value);
    			t13 = text("!");
    			t14 = space();
    			label0 = element("label");
    			input1 = element("input");
    			t15 = space();
    			input2 = element("input");
    			t16 = space();
    			label1 = element("label");
    			input3 = element("input");
    			t17 = space();
    			input4 = element("input");
    			t18 = space();
    			p2 = element("p");
    			t19 = text(/*a*/ ctx[1]);
    			t20 = text(" X ");
    			t21 = text(/*b*/ ctx[2]);
    			t22 = text(" = ");
    			t23 = text(t23_value);
    			t24 = space();
    			label2 = element("label");
    			input5 = element("input");
    			t25 = text("\n  약관 동의");
    			t26 = space();
    			if_block.c();
    			t27 = space();
    			button = element("button");
    			t28 = text("구독");
    			add_location(h30, file$1, 26, 0, 445);
    			if (/*selected*/ ctx[5] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[9].call(select));
    			add_location(select, file$1, 27, 0, 466);
    			add_location(h31, file$1, 33, 0, 631);
    			add_location(p0, file$1, 40, 0, 771);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "이름을 입력하세요.");
    			add_location(input0, file$1, 42, 0, 814);
    			add_location(p1, file$1, 43, 0, 877);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "10");
    			add_location(input1, file$1, 46, 2, 918);
    			attr_dev(input2, "type", "range");
    			attr_dev(input2, "min", "0");
    			attr_dev(input2, "max", "10");
    			add_location(input2, file$1, 47, 2, 968);
    			add_location(label0, file$1, 45, 0, 908);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "min", "0");
    			attr_dev(input3, "max", "10");
    			add_location(input3, file$1, 51, 2, 1035);
    			attr_dev(input4, "type", "range");
    			attr_dev(input4, "min", "0");
    			attr_dev(input4, "max", "10");
    			add_location(input4, file$1, 52, 2, 1085);
    			add_location(label1, file$1, 50, 0, 1025);
    			add_location(p2, file$1, 55, 0, 1142);
    			attr_dev(input5, "type", "checkbox");
    			add_location(input5, file$1, 58, 2, 1180);
    			add_location(label2, file$1, 57, 0, 1170);
    			button.disabled = button_disabled_value = !/*chk*/ ctx[3];
    			add_location(button, file$1, 68, 0, 1355);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h30, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[5]);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, h31, anchor);
    			insert_dev(target, t4, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t5, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t6);
    			append_dev(p0, t7);
    			append_dev(p0, t8);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, input0, anchor);
    			set_input_value(input0, /*name*/ ctx[0]);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t11);
    			append_dev(p1, t12);
    			append_dev(p1, t13);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, label0, anchor);
    			append_dev(label0, input1);
    			set_input_value(input1, /*a*/ ctx[1]);
    			append_dev(label0, t15);
    			append_dev(label0, input2);
    			set_input_value(input2, /*a*/ ctx[1]);
    			insert_dev(target, t16, anchor);
    			insert_dev(target, label1, anchor);
    			append_dev(label1, input3);
    			set_input_value(input3, /*b*/ ctx[2]);
    			append_dev(label1, t17);
    			append_dev(label1, input4);
    			set_input_value(input4, /*b*/ ctx[2]);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t19);
    			append_dev(p2, t20);
    			append_dev(p2, t21);
    			append_dev(p2, t22);
    			append_dev(p2, t23);
    			insert_dev(target, t24, anchor);
    			insert_dev(target, label2, anchor);
    			append_dev(label2, input5);
    			input5.checked = /*chk*/ ctx[3];
    			append_dev(label2, t25);
    			insert_dev(target, t26, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, t27, anchor);
    			insert_dev(target, button, anchor);
    			append_dev(button, t28);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[9]),
    					listen_dev(select, "change", /*selectChange*/ ctx[8], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[12]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[13]),
    					listen_dev(input2, "change", /*input2_change_input_handler*/ ctx[14]),
    					listen_dev(input2, "input", /*input2_change_input_handler*/ ctx[14]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[15]),
    					listen_dev(input4, "change", /*input4_change_input_handler*/ ctx[16]),
    					listen_dev(input4, "input", /*input4_change_input_handler*/ ctx[16]),
    					listen_dev(input5, "change", /*input5_change_handler*/ ctx[17])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*portals*/ 128) {
    				each_value_1 = /*portals*/ ctx[7];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*selected, portals*/ 160) {
    				select_option(select, /*selected*/ ctx[5]);
    			}

    			if (dirty & /*sizes, choiceSize*/ 80) {
    				each_value = /*sizes*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t5.parentNode, t5);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*choiceSize*/ 16 && t7_value !== (t7_value = /*sizes*/ ctx[6][/*choiceSize*/ ctx[4]] + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*name*/ 1 && input0.value !== /*name*/ ctx[0]) {
    				set_input_value(input0, /*name*/ ctx[0]);
    			}

    			if (dirty & /*name*/ 1 && t12_value !== (t12_value = (/*name*/ ctx[0] || '낯선 사람') + "")) set_data_dev(t12, t12_value);

    			if (dirty & /*a*/ 2 && to_number(input1.value) !== /*a*/ ctx[1]) {
    				set_input_value(input1, /*a*/ ctx[1]);
    			}

    			if (dirty & /*a*/ 2) {
    				set_input_value(input2, /*a*/ ctx[1]);
    			}

    			if (dirty & /*b*/ 4 && to_number(input3.value) !== /*b*/ ctx[2]) {
    				set_input_value(input3, /*b*/ ctx[2]);
    			}

    			if (dirty & /*b*/ 4) {
    				set_input_value(input4, /*b*/ ctx[2]);
    			}

    			if (dirty & /*a*/ 2) set_data_dev(t19, /*a*/ ctx[1]);
    			if (dirty & /*b*/ 4) set_data_dev(t21, /*b*/ ctx[2]);
    			if (dirty & /*a, b*/ 6 && t23_value !== (t23_value = /*a*/ ctx[1] * /*b*/ ctx[2] + "")) set_data_dev(t23, t23_value);

    			if (dirty & /*chk*/ 8) {
    				input5.checked = /*chk*/ ctx[3];
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t27.parentNode, t27);
    				}
    			}

    			if (dirty & /*chk*/ 8 && button_disabled_value !== (button_disabled_value = !/*chk*/ ctx[3])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t4);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(label0);
    			if (detaching) detach_dev(t16);
    			if (detaching) detach_dev(label1);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t24);
    			if (detaching) detach_dev(label2);
    			if (detaching) detach_dev(t26);
    			if_block.d(detaching);
    			if (detaching) detach_dev(t27);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bind', slots, []);
    	let name = '';
    	let a = 1;
    	let b = 2;
    	let chk = false;
    	let choiceSize = 0;
    	let sizes = ['Tall', 'Grande', 'Venti'];

    	let portals = [
    		{ name: '사이트선택', url: null },
    		{ name: '네이버', url: 'https://naver.com' },
    		{ name: '다음', url: 'https://daum.net' },
    		{ name: '구글', url: 'https://google.com' }
    	];

    	let selected;

    	function selectChange() {
    		if (selected != null) {
    			window.open(selected);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Bind> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(5, selected);
    		$$invalidate(7, portals);
    	}

    	function input_change_handler() {
    		choiceSize = this.__value;
    		$$invalidate(4, choiceSize);
    	}

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(0, name);
    	}

    	function input1_input_handler() {
    		a = to_number(this.value);
    		$$invalidate(1, a);
    	}

    	function input2_change_input_handler() {
    		a = to_number(this.value);
    		$$invalidate(1, a);
    	}

    	function input3_input_handler() {
    		b = to_number(this.value);
    		$$invalidate(2, b);
    	}

    	function input4_change_input_handler() {
    		b = to_number(this.value);
    		$$invalidate(2, b);
    	}

    	function input5_change_handler() {
    		chk = this.checked;
    		$$invalidate(3, chk);
    	}

    	$$self.$capture_state = () => ({
    		name,
    		a,
    		b,
    		chk,
    		choiceSize,
    		sizes,
    		portals,
    		selected,
    		selectChange
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('a' in $$props) $$invalidate(1, a = $$props.a);
    		if ('b' in $$props) $$invalidate(2, b = $$props.b);
    		if ('chk' in $$props) $$invalidate(3, chk = $$props.chk);
    		if ('choiceSize' in $$props) $$invalidate(4, choiceSize = $$props.choiceSize);
    		if ('sizes' in $$props) $$invalidate(6, sizes = $$props.sizes);
    		if ('portals' in $$props) $$invalidate(7, portals = $$props.portals);
    		if ('selected' in $$props) $$invalidate(5, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		a,
    		b,
    		chk,
    		choiceSize,
    		selected,
    		sizes,
    		portals,
    		selectChange,
    		select_change_handler,
    		input_change_handler,
    		$$binding_groups,
    		input0_input_handler,
    		input1_input_handler,
    		input2_change_input_handler,
    		input3_input_handler,
    		input4_change_input_handler,
    		input5_change_handler
    	];
    }

    class Bind extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bind",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.55.1 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let bind_1;
    	let t0;
    	let login;
    	let t1;
    	let child0;
    	let t2;
    	let child1;
    	let t3;
    	let mainpage;
    	let t4;
    	let hr;
    	let t5;
    	let productpage;
    	let current;
    	bind_1 = new Bind({ $$inline: true });
    	login = new Login({ $$inline: true });
    	const child0_spread_levels = [/*allData01*/ ctx[0]];
    	let child0_props = {};

    	for (let i = 0; i < child0_spread_levels.length; i += 1) {
    		child0_props = assign(child0_props, child0_spread_levels[i]);
    	}

    	child0 = new Child({ props: child0_props, $$inline: true });
    	const child1_spread_levels = [/*allData02*/ ctx[1]];
    	let child1_props = {};

    	for (let i = 0; i < child1_spread_levels.length; i += 1) {
    		child1_props = assign(child1_props, child1_spread_levels[i]);
    	}

    	child1 = new Child({ props: child1_props, $$inline: true });
    	mainpage = new Mainpage({ $$inline: true });
    	productpage = new Productpage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(bind_1.$$.fragment);
    			t0 = space();
    			create_component(login.$$.fragment);
    			t1 = space();
    			create_component(child0.$$.fragment);
    			t2 = space();
    			create_component(child1.$$.fragment);
    			t3 = space();
    			create_component(mainpage.$$.fragment);
    			t4 = space();
    			hr = element("hr");
    			t5 = space();
    			create_component(productpage.$$.fragment);
    			add_location(hr, file, 28, 0, 486);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(bind_1, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(login, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(child0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(child1, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(mainpage, target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(productpage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const child0_changes = (dirty & /*allData01*/ 1)
    			? get_spread_update(child0_spread_levels, [get_spread_object(/*allData01*/ ctx[0])])
    			: {};

    			child0.$set(child0_changes);

    			const child1_changes = (dirty & /*allData02*/ 2)
    			? get_spread_update(child1_spread_levels, [get_spread_object(/*allData02*/ ctx[1])])
    			: {};

    			child1.$set(child1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bind_1.$$.fragment, local);
    			transition_in(login.$$.fragment, local);
    			transition_in(child0.$$.fragment, local);
    			transition_in(child1.$$.fragment, local);
    			transition_in(mainpage.$$.fragment, local);
    			transition_in(productpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bind_1.$$.fragment, local);
    			transition_out(login.$$.fragment, local);
    			transition_out(child0.$$.fragment, local);
    			transition_out(child1.$$.fragment, local);
    			transition_out(mainpage.$$.fragment, local);
    			transition_out(productpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(bind_1, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(login, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(child0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(child1, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(mainpage, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t5);
    			destroy_component(productpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let age01 = 20;
    	let age02 = 21;
    	const allData01 = { user: '김철수', age: age01, hobby: '축구하기' };
    	const allData02 = { user: '김영희', age: age02, hobby: '넷플릭스보기' };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Mainpage,
    		Productpage,
    		Child,
    		Login,
    		Bind,
    		age01,
    		age02,
    		allData01,
    		allData02
    	});

    	$$self.$inject_state = $$props => {
    		if ('age01' in $$props) age01 = $$props.age01;
    		if ('age02' in $$props) age02 = $$props.age02;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [allData01, allData02];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
