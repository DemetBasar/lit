/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// tslint:disable:enforce-comments-on-exported-symbols enforce-name-casing
import * as d3 from 'd3';

import {TemplateResult} from 'lit-html';
import {isLitSubtype} from './utils';

// tslint:disable-next-line:no-any
export type D3Selection = d3.Selection<any, any, any, any>;

export type LitClass = 'LitType';
export type LitName = 'LitType'|'TextSegment'|'GeneratedText'|'Tokens'|
    'TokenTopKPreds'|'Scalar'|'RegressionScore'|'CategoryLabel'|
    'MulticlassPreds'|'SequenceTags'|'SpanLabels'|'EdgeLabels'|'Embeddings'|
    'TokenGradients'|'TokenEmbeddings'|'AttentionHeads'|'SparseMultilabel'|
    'FieldMatcher';

export interface LitType {
  __class__: LitClass;
  __name__: LitName;
  __mro__: string[];
  parent?: string;
  align?: string|string[];
  vocab?: string[];
  null_idx?: number;
  required?: boolean;
  default? : string|string[]|number|number[];
  spec?: string;
  type?: LitName;
}

export interface Spec {
  [key: string]: LitType;
}

// TODO(lit-team): rename this interface to avoid confusion with the .spec
// field.
export interface DatasetSpec {
  spec: Spec;
  description?: string;
}

export interface DatasetsMap {
  [datasetName: string]: DatasetSpec;
}

export interface GeneratorsMap {
  [generatorName: string]: Spec;
}

export interface CallConfig {
  [option: string]: string|number|boolean|CallConfig;
}

// TODO(lit-team): rename this interface to avoid confusion with the .spec
// field.
export interface ModelSpec {
  datasets: string[];
  generators: string[];
  interpreters: string[];
  spec: {
    input: Spec,
    output: Spec,
  };
  description?: string;
}

export interface ModelsMap {
  [modelName: string]: ModelSpec;
}

export interface LitMetadata {
  datasets: DatasetsMap;
  generators: GeneratorsMap;
  interpreters: string[];
  models: ModelsMap;
  demoMode: boolean;
  defaultLayout: string;
  canonicalURL?: string;
}

export interface Input {
  // tslint:disable-next-line:no-any
  [key: string]: any;
}

export interface IndexedInput {
  id: string;
  data: Input;
  // tslint:disable-next-line:no-any
  meta: {[key: string]: any;};
}

/**
 * Examples faceted by a given set of features.
 */
export interface FacetedData {
  'data': IndexedInput[];
  /** Name to display */
  'displayName'?: string;
  /** What values were used as filters to get this data */
  'facets'?: FacetMap;
}

/**
 * Dictionary of multiple sets of faceted data.
 */
export interface GroupedExamples {
  [key: string]: FacetedData;
}


export interface Preds {
  // tslint:disable-next-line:no-any
  [key: string]: any;
}

export interface TopKResult {
  // tslint:disable-next-line:enforce-name-casing
  0: string;
  1: number;
}

export interface SpanLabel {
  'start': number;  // inclusive
  'end': number;    // exclusive
  'label': string;
}
export function formatSpanLabel(s: SpanLabel): string {
  // Add non-breaking control chars to keep this on one line
  // TODO(lit-dev): get it to stop breaking between ) and :; \u2060 doesn't work
  return `[${s.start}, ${s.end})\u2060: ${s.label}`.replace(
      /\ /g, '\u00a0' /* &nbsp; */);
}

/**
 * Represents a directed edge between two mentions.
 * If span2 is null, interpret as a single span label.
 * See https://arxiv.org/abs/1905.06316 for more on this formalism.
 */
export interface EdgeLabel {
  'span1': [number, number];   // inclusive, exclusive
  'span2'?: [number, number];  // inclusive, exclusive
  'label': string|number;
}
export function formatEdgeLabel(e: EdgeLabel): string {
  const formatSpan = (s: [number, number]) => `[${s[0]}, ${s[1]})`;
  const span1Text = formatSpan(e.span1);
  const span2Text = e.span2 ? ' ← ' + formatSpan(e.span2) : '';
  // Add non-breaking control chars to keep this on one line
  // TODO(lit-dev): get it to stop breaking between ) and :; \u2060 doesn't work
  return `${span1Text}${span2Text}\u2060: ${e.label}`.replace(
      /\ /g, '\u00a0' /* &nbsp; */);
}

/**
 * Type for d3 scale object used for datapoint coloring.
 */
export interface D3Scale {
  (value: number|string): string;
  domain: () => Array<number|string>;
}

/**
 * Object to specify a coloring option for datapoints.
 */
export interface ColorOption {
  name: string;
  // Function to convert a datapoint into a number or string to be provided to
  // the scale property for conversion to a color.
  getValue: (input: IndexedInput) => number | string;
  // D3 scale object to convert a value returned from getValue into a color
  // string.
  scale: D3Scale;
}

export interface NumericSetting {
  [key: string]: number;
}

/**
 * Generic wrapper type for constructors, used in the DI system
 */
// tslint:disable:no-any
export type Constructor<T> = {
  new (...args: any[]): T
}|((...args: any[]) => T)|Function;
// tslint:enable:no-any

/**
 * Dictionary of features (e.g., features of an Input). Used for grouping sets
 * of Inputs in the slices module, metrics module, etc. Features may be strings
 * (e.g. 'neutral', 'entailment'), or numerical features (e.g., sentence
 * similarity in stsb).
 */
export interface FacetMap {
  [fieldName: string]: string|number;
}

/**
 * Identity of a module triggering an action in this service.
 * Usually, set to 'this' from the calling module, so it can distinguish
 * selection updates from itself vs another module.
 */
export type ServiceUser = object|null;

/**
 * We can't define abstract static properties/methods in typescript, so we
 * define an interface to emulate the LitModuleType.
 */
export interface LitModuleClass {
  title: string;
  template:
      (modelName?: string, selectionServiceIndex?: number) => TemplateResult;
  shouldDisplayModule: (modelSpecs: ModelsMap, datasetSpec: Spec) => boolean;
  duplicateForExampleComparison: boolean;
  duplicateForModelComparison: boolean;
  duplicateAsRow: boolean;
  numCols: number;
  collapseByDefault: boolean;
}

/**
 * Get the default value for a spec field.
 */
export function defaultValueByField(key: string, spec: Spec) {
  const fieldSpec: LitType = spec[key];
  // Explicitly check against undefined, as this value is often false-y if set.
  if (fieldSpec.default !== undefined) {
    return fieldSpec.default;
  }
  // TODO(lit-dev): remove these and always use the spec default value.
  if (isLitSubtype(fieldSpec, 'Scalar')) {
    return 0;
  }
  const listFieldTypes: LitName[] = [
    'Tokens', 'SequenceTags', 'SpanLabels', 'EdgeLabels', 'SparseMultilabel'
  ];
  if (isLitSubtype(fieldSpec, listFieldTypes)) {
    return [];
  }
  const stringFieldTypes: LitName[] = ['TextSegment', 'CategoryLabel'];
  if (isLitSubtype(fieldSpec, stringFieldTypes)) {
    return '';
  }
  console.log(
      'Warning: default value requested for unrecognized input field type',
      key, fieldSpec);
  return '';
}

/**
 * Dictionary of lit layouts. See LitComponentLayout
 */
export declare interface LitComponentLayouts {
  [key: string] : LitComponentLayout;
}

/**
 * A layout is defined by a set of main components that are always visible,
 * (designated in the object by the "main" key)
 * and a set of tabs that each contain a group other components.
 *
 * LitComponentLayout is a mapping of tab names to module types.
 */
export declare interface LitComponentLayout {
  components: {[name: string]: LitModuleClass[];};
  layoutSettings?: LayoutSettings;
  description ?: string;
}

/**
 * Miscellaneous render settings (e.g., whether to render a toolbar)
 * for a given layout.
 */
export declare interface LayoutSettings {
  hideToolbar?: boolean;
  mainHeight?: number;
  centerPage?: boolean;
}

/** Display name for the "no dataset" dataset in settings. */
export const NONE_DS_DISPLAY_NAME = 'none';
/** Key for the "no dataset" dataset in settings. */
export const NONE_DS_DICT_KEY = '_union_empty';

/**
 * Display name for dataset.
 */
export function datasetDisplayName(name: string): string {
  return name === NONE_DS_DICT_KEY ? NONE_DS_DISPLAY_NAME : name;
}

/**
 * Formats the following types for display in the data table:
 * string, number, boolean, string[], number[], (string|number)[]
 * TODO(lit-dev): allow passing custom HTML to table, not just strings.
 */
// tslint:disable-next-line:no-any
export function formatForDisplay(input: any, fieldSpec?: LitType): string {
  if (input == null) return '';

  // Handle SpanLabels, if field spec given.
  // TODO(lit-dev): handle more fields this way.
  if (fieldSpec != null && isLitSubtype(fieldSpec, 'SpanLabels')) {
    const formattedTags = (input as SpanLabel[]).map(formatSpanLabel);
    return formattedTags.join(', ');
  }
  // Handle EdgeLabels, if field spec given.
  if (fieldSpec != null && isLitSubtype(fieldSpec, 'EdgeLabels')) {
    const formattedTags = (input as EdgeLabel[]).map(formatEdgeLabel);
    return formattedTags.join(', ');
  }
  const formatNumber = (item: number) =>
    Number.isInteger(item) ? item.toString() : item.toFixed(4).toString();

  // Generic data, based on type of input.
  if (Array.isArray(input)) {
    const strings = input.map((item) => {
      if (typeof item === 'number') {
        return formatNumber(item);
      }
      return `${item}`;
    });
    return `${strings.join(', ')}`;
  }

  if (typeof input === 'boolean') {
    return input ? '✔' : ' ';
  }

  if (typeof input === 'number') {
    return formatNumber(input);
  }

  // Fallback: just coerce to string.
  return `${input}`;
}
