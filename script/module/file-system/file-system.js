import { fileSystemTree } from "/script/module/data/app-data.js";
import { FileSystemNode } from "/script/module/file-system/file-system-node.js";

class FileSystem
{
    // constructor
    constructor(existingFileSystem = null) {
        this.root = new FileSystemNode('/', 2);
        this.currentNode = this.root;

        if (existingFileSystem) {
            this.buildFileSystem(this.root, existingFileSystem['/'].children);
        }
    }

    // this method ...
    buildFileSystem(node, structure) {
        for (const [name, info] of Object.entries(structure)) {
            const childNode = new FileSystemNode(name, info.type, node, info.data, info.size);

            node.children[name] = childNode;
            if (info.type === 2 && info.children) {
                this.buildFileSystem(childNode, info.children);
            }
        }
    }

    // this method ...
    traverse(path = '.') {
        const pathSection = path.split('/').filter(part => part.length > 0);
        let currentNode = this.currentNode;

        for (const part of pathSection) {
            if (part === '.') { continue; }

            if (part === '..') {
                if (currentNode.parent !== null) {
                    currentNode = currentNode.parent;
                    return currentNode;
                }
                throw new Error(`terminal: cd: Permission denied`);
            }

            if (currentNode.type !== 2 || !(part in currentNode.children)) {
                throw new Error(`Path not found: ${path}`);
            }
            currentNode = currentNode.children[part];
        }

        return currentNode;
    }

    // this method ...
    cat(filename = null) {
        if(filename === null) { throw new Error(`cat: Must specify a file`); }

        if(this.currentNode.children[filename] === undefined) {
            throw new Error(`cat: ${filename}: No such file or directory`);
        }

        if(this.currentNode.children[filename].type === 2) {
            throw new Error(`cat: ${filename}: Is a directory`);
        }

        if(this.currentNode.children[filename].type === 1) {
            throw new Error(`cat: ${filename}: Is an executable`);
        }

        if(this.currentNode.children[filename].data === undefined) {
            return '';
        }

        return this.currentNode.children[filename].data;
    }

    // this method ...
    pwd() {
        let path = '';
        let currentNode = this.currentNode;

        while (currentNode !== null) {
            path = '/' + currentNode.name + path;
            currentNode = currentNode.parent;
        }

        // Ensure the root is represented correctly
        return path === '//' ? '/' : path.substring(2);
    }

    // this method ...
    ls(path = '.') {
        const node = ((path === '/')? this.root : this.traverse(path));
        // const node = this.traverse(path);

        if(node.type !== 2) { throw new Error('Cannot list contents of a file'); }
        return Object.keys(node.children).map(name=> ({
            name,
            type: node.children[name].type,
            size: node.children[name].size
        }));
    }

    // @todo maybe later...
    // mkdir(path) {
    //     const parts = path.split('/').filter(part => part.length > 0);
    //     let currentNode = this.root;
    //
    //     for (const part of parts) {
    //         if (currentNode.type !== 2) {
    //             throw new Error(`Path not found: ${path}`);
    //         }
    //         if (!(part in currentNode.children)) {
    //             currentNode.children[part] = new FileSystemNode(part, true, currentNode);
    //         }
    //         currentNode = currentNode.children[part];
    //     }
    // }

    cd(path = '.') {
        // console.log(path);
        const node = ((path === '/')? this.root : this.traverse(path));
        // const node = this.traverse(path);

        if (node.type !== 2) {
            throw new Error('Cannot change to a file');
        }

        this.currentNode = node;
    }
}



export const fileSystem = new FileSystem(fileSystemTree);