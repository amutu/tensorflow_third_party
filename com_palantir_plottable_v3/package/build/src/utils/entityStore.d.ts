import { Bounds, Point } from "../core/interfaces";
export interface IPositionedEntity {
    position: Point;
}
/**
 * EntityStore stores entities and makes them searchable. Valid entities must be
 * positioned in Cartesian space.
 */
export interface IEntityStore<T extends IPositionedEntity> {
    /**
     * Adds all of the supplied entities to the store.
     *
     * If the optional bounds argument is provided, only entities within the
     * bounds will be available to `entityNearest` queries. Regardless, all
     * entities will be available with the `entities` method.
     *
     * @param {T[]} [entities] Entity array to add to the store. Entities must be
     * positionable
     * @param {Bounds} [bounds] Optionally add bounds filter for entityNearest
     * queries
     */
    addAll(entities: T[], bounds?: Bounds): void;
    /**
     * Returns the entity closest to a given {Point}
     *
     * Note that if a {Bounds} was provided to the `addAll` method, entities
     * outside those bounds will not be returned by this method.
     *
     * @param {Point} [point] Point around which to search for a closest entity
     * @returns {T} Will return the nearest entity or undefined if none are found
     */
    entityNearest(point: Point): T;
    /**
     * Returns the current internal array of all entities.
     *
     * @returns {T[]} the current internal array of entities.
     */
    entities(): T[];
}
/**
 * Implementation of {IEntityStore} that uses an array for easy iteration as
 * well as a quad tree for fast nearest-point queries.
 *
 * Note that if the position of your entities changes, you MUST rebuild the
 * entity store for the `entityNearest` method to work since the quadtree does
 * not know that its nodes have moved.
 */
export declare class EntityStore<T extends IPositionedEntity> implements IEntityStore<T> {
    private _entities;
    private _tree;
    constructor();
    addAll(entities: T[], bounds?: Bounds): void;
    entityNearest(queryPoint: Point): T;
    entities(): T[];
}
