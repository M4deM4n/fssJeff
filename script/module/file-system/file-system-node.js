export class FileSystemNode {
    constructor(name, type = 0, parent = null, data = null, size = null)
    {
        this.name = name;

        // type 0:file 1:executable 2:directory
        this.type = type;

        this.children = (this.type === 2 ? {} : null); // Only directories have children
        this.parent = parent;
        this.data = data;
        this.size = size;

    }
}