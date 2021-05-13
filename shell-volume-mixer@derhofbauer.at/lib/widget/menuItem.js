/**
 * Shell Volume Mixer
 *
 * Menu items.
 *
 * @author Alexander Hofbauer <alex@derhofbauer.at>
 */

/* exported MasterMenuItem, SubMenuItem */

const Clutter = imports.gi.Clutter;
const GObject = imports.gi.GObject;
const Lib = imports.misc.extensionUtils.getCurrentExtension().imports.lib;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;

const Slider = Lib.widget.slider;


let makeItemLine = function(ornament) {
    let line = new St.BoxLayout({ style_class: 'popup-menu-item svm-container-line' });

    if (ornament === undefined) {
        ornament = new St.Label({ style_class: 'popup-menu-ornament' });
    }

    if (ornament) {
        line.add(ornament);
    }

    return line;
};

let prepareMenuItem = function(instance) {
    instance.get_children().map(child => {
        instance.remove_actor(child);
    });

    instance.container = new St.BoxLayout({
        vertical: true,
        x_expand: true,
        style_class: 'svm-menu-item-container',
    });
    instance.add(instance.container);

    if (!instance.firstLine) {
        instance.firstLine = makeItemLine(instance._ornamentLabel);
        instance.container.add(instance.firstLine);
    }

    if (!instance.secondLine) {
        instance.secondLine = makeItemLine();
        instance.container.add(instance.secondLine);
    }

    instance.firstLine.add_style_class_name('line-1');
    instance.secondLine.add_style_class_name('line-2');
};


/**
 * Submenu item for the sink selection menu.
 */
var MasterMenuItem = GObject.registerClass(class MasterMenuItem extends PopupMenu.PopupSubMenuMenuItem
{
    _init() {
        super._init('', true);
        prepareMenuItem(this);

        this._slider = new Slider.VolumeSlider(0);

        this.firstLine.add_child(this.icon);
        this.firstLine.add(this.label);

        this.firstLine.add_child(new St.Bin({
            style_class: 'popup-menu-item-expander',
            x_expand: true,
        }));

        this.firstLine.add_child(this._triangleBin);

        this.secondLine.add(this._slider);
        this.secondLine.add_style_class_name('svm-master-slider-line');

        this.label.add_style_class_name('svm-master-label');
        this.add_style_class_name('svm-master-slider svm-menu-item');
    }

    _onButtonReleaseEvent(actor, event) {
        if (event.get_button() === 2) {
            return Clutter.EVENT_STOP;
        }
        return super._onButtonReleaseEvent(actor, event);
    }

    /**
     * Change volume on left / right.
     */
    _onKeyPressEvent(actor, event) {
        let symbol = event.get_key_symbol();

        if (symbol == Clutter.KEY_Right || symbol == Clutter.KEY_Left) {
            return this._slider.vfunc_key_press_event(event);
        }

        return super._onKeyPressEvent(actor, event);
    }

    addMenuItem(item) {
        let pos = (this.menu._getMenuItems().length || 0) - 1;

        this.menu.addMenuItem(item, pos < 0 ? 0 : pos);
    }
});


/**
 * Sub menu item implementation for dropdown menus (via master slider menu or input menu).
 */
var SubMenuItem = GObject.registerClass(class SubMenuItem extends PopupMenu.PopupBaseMenuItem
{
    _init(params) {
        super._init(params);
        prepareMenuItem(this);
    }

    addChildAt(child, pos) {
        let line = makeItemLine();

        line.add_child(child);
        this.container.insert_child_at_index(line, pos);

        return line;
    }

    setSelected(selected) {
        this.active = selected;
        this.setOrnament(selected === true ? PopupMenu.Ornament.DOT : PopupMenu.Ornament.NONE);
    }
});
