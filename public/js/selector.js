export function getSelector(node) {
    const id = node.getAttribute('id');
    if (id) {
        return `#${id}`;
    }

    let path = '';
    let parent = node;

    while (parent) {
        node = parent;
        let name = node.localName;
        parent = node.parentNode;

        if (!parent) {
            path = name + ' > ' + path;
            continue;
        }

        if (node.getAttribute('id')) {
            path = '#' + node.getAttribute('id') + ' > ' + path;
            break;
        }

        const sameTagSiblings = [];
        const children = Array.prototype.slice.call(parent.childNodes);

        children.forEach(function (child) {
            if (child.localName === name) {
                sameTagSiblings.push(child);
            }
        });

        // if there are more than one child(ren) of that type use nth-of-type
        if (sameTagSiblings.length > 1) {
            const index = sameTagSiblings.indexOf(node);
            name += ':nth-of-type(' + (index + 1) + ')';
        }

        if (path) {
            path = name + ' > ' + path;
        } else {
            path = name;
        }
    }

    return path;
}