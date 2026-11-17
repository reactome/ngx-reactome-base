import type cytoscape from 'cytoscape';
type BackgroundImage = cytoscape.Css.BackgroundImage;
type PropertyValueNode<T> = cytoscape.Css.PropertyValueNode<T>;
import { Properties } from '../properties';

/**
 * One layer of a node's background: one value of each property. Cytoscape's
 * types also allow a list of values, one per layer, which is what the layers
 * become once aggregated (`Aggregated`), never what one layer holds.
 */
export type Layer = {
  [k in keyof BackgroundImage]: BackgroundImage[k] extends PropertyValueNode<infer X>
    ? Exclude<X, readonly unknown[]>
    : never;
};

export type Image = Layer & { requireGradient?: boolean; optional?: boolean };

export interface Drawer {
  background?: Image;
  select?: Image;
  hover?: Image;
  flag?: Image;
  decorators?: Image[];
  analysis?: Image;
}

export interface DrawerParameters {
  id: number | string;
  width: number;
  height: number;
  drug?: boolean;
  disease?: boolean;
  crossed?: boolean;
  interactor?: boolean;
  lossOfFunction?: boolean;
}

export interface DrawerProvider {
  (properties: Properties, params: DrawerParameters): Drawer;
}

/** Each property's values for every layer, in layer order, as cytoscape takes them. */
export type Aggregated = {
  [k in keyof Layer]-?: NonNullable<Layer[k]>[];
};
