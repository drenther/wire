"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const mobx_1 = require("mobx");
const _ = require("lodash");
const Node_1 = require("./Node");
const Connection_1 = require("./Connection");
const Port_1 = require("./Port");
const Nodes = require("./nodes");
class Context {
    /**
     * Context Instance Constructor
     */
    constructor(props = {}) {
        /**
         * Optional data store
         */
        this.data = {};
        _.defaults(props, {
            id: uuid_1.v4(),
            data: {}
        });
        this.id = props.id;
        this.data = props.data;
        this.nodes = new Map();
        this.connections = new Map();
    }
    /**
     * Creates a node and adds it to the context
     * @param node {Node} - A Node
     */
    addNode(node) {
        if (node instanceof Node_1.Node) {
            this.nodes.set(node.id, node);
            return node;
        }
    }
    /**
     * Removes a node from the context
     * @param node {Node} - Node to remove
     */
    removeNode(node) {
        if (node instanceof Node_1.Node && this.nodes.has(node.id)) {
            this.nodes.delete(node.id);
        }
        else {
            throw new Error('Node Removal Failed - Node does not exist in context');
        }
    }
    /**
     * Creates a connection between an inputPort and outputPort, and adds it to the context
     * @param connectionProps {ConnectionProps} - Connection Properties
     */
    createConnection(connectionProps) {
        const { fromPort, toPort } = connectionProps;
        if (fromPort.type !== Port_1.PortType.OUTPUT) {
            throw new Error('Connection Failed - fromPort must be of type OUTPUT');
        }
        else if (toPort.type !== Port_1.PortType.INPUT) {
            throw new Error('Connection Failed - toPort must be of type INPUT');
        }
        if (toPort.isConnected) {
            throw new Error('Connection Failed - toPort is already connected');
        }
        if (fromPort.node === toPort.node) {
            throw new Error('Connection Failed - Ports must be on different nodes');
        }
        const connection = new Connection_1.Connection(this, connectionProps);
        if (connection) {
            this.connections.set(connection.id, connection);
            return connection;
        }
    }
    /**
     * Removes a connection from the context
     * @param connection {Connection} - Connection to remove
     */
    removeConnection(connection) {
        if (this.connections.has(connection.id)) {
            this.connections.delete(connection.id);
        }
        else {
            throw new Error('Connection Removal Failed - Connection does not exist in context');
        }
    }
    /**
     * Serializes Context
     */
    serialize() {
        return {
            id: this.id,
            data: this.data,
            nodes: [...this.nodes.values()].map(node => node.serialize()),
            connections: [...this.connections.values()].map(connection => connection.serialize())
        };
    }
    /**
     * Imports a serialized Context
     * @param importableContext
     */
    static import(importableContext, customNodes = {}) {
        const context = new this({
            id: importableContext.id
        });
        const availableNodeClasses = _.merge(Nodes, customNodes);
        for (const node of importableContext.nodes) {
            const n = availableNodeClasses[node.name];
            if (Object.getPrototypeOf(n) === Node_1.Node) {
                new n(context, node);
            }
        }
        for (const connection of importableContext.connections) {
            let fromPort;
            let toPort;
            context.nodes.forEach(node => {
                for (const op in node.outputPorts) {
                    if (node.outputPorts[op].id === connection.fromPortId)
                        fromPort = node.outputPorts[op];
                }
                for (const ip in node.inputPorts) {
                    if (node.inputPorts[ip].id === connection.toPortId)
                        toPort = node.inputPorts[ip];
                }
            });
            context.createConnection({
                id: connection.id,
                fromPort,
                toPort
            });
        }
        return context;
    }
}
__decorate([
    mobx_1.observable
], Context.prototype, "id", void 0);
__decorate([
    mobx_1.observable
], Context.prototype, "data", void 0);
__decorate([
    mobx_1.observable
], Context.prototype, "nodes", void 0);
__decorate([
    mobx_1.observable
], Context.prototype, "connections", void 0);
__decorate([
    mobx_1.action
], Context.prototype, "addNode", null);
__decorate([
    mobx_1.action
], Context.prototype, "removeNode", null);
__decorate([
    mobx_1.action
], Context.prototype, "createConnection", null);
__decorate([
    mobx_1.action
], Context.prototype, "removeConnection", null);
exports.Context = Context;
