import {
  GridAggregationApplierFunction,
  GridAggregationReducerFunction,
} from './gridAggregationInterfaces';

export const sum: GridAggregationReducerFunction<number> = {
  label: 'Sum',
  footerLabel: '=',
  columnTypes: ['number'],
  reduce: (acc = 0, value, params) => {
    if (typeof value !== 'number') {
      return acc;
    }
    return acc + (value ?? 0);
  },
};

export const max: GridAggregationReducerFunction<number> = {
  label: 'Max',
  footerLabel: 'Max',
  columnTypes: ['number', 'date', 'dateTime'],
  reduce: (acc, value) => {
    if (typeof value !== 'number') {
      return acc;
    }
    if (value > acc) {
      return value;
    }
    return acc;
  },
};

export const min: GridAggregationReducerFunction<number> = {
  label: 'Min',
  footerLabel: 'Min',
  columnTypes: ['number', 'date', 'dateTime'],
  reduce: (acc, value) => {
    if (typeof value !== 'number') {
      return acc;
    }
    if (value < acc) {
      return value;
    }
    return acc;
  },
};

export const avg: GridAggregationReducerFunction<number> = {
  label: 'Average',
  footerLabel: 'Avg',
  columnTypes: ['number'],
  reduce: (acc, value) => {
    if (typeof value !== 'number') {
      return acc;
    }
    return acc + (value ?? 0);
  },
  postReduce: (acc, { count }) => {
    return acc / count;
  },
  valueFormatter: (value) => round(value, 2) + 'haha',
};

export const count: GridAggregationReducerFunction<any> = {
  label: 'Count',
  footerLabel: 'Count',
  columnTypes: ['number', 'date', 'dateTime', 'string', 'boolean'],
  reduce: (acc) => {
    return acc + 1;
  },
};

export const countExists: GridAggregationReducerFunction<any> = {
  label: 'Count (non-empty)',
  footerLabel: 'count',
  reduce: (acc, value) => {
    if (value == null || value === '' || value === false) {
      return acc;
    }
    return acc + 1;
  },
};

export const distinct: GridAggregationApplierFunction<number> = {
  label: 'Distinct',
  footerLabel: 'Distinct',
  columnTypes: ['string'],
  apply: (values) => {
    return new Set(values).size;
  },
};

export const sumApply: GridAggregationApplierFunction<number | undefined> = {
  label: 'Sum',
  footerLabel: 'Sum',
  apply: (values) => {
    return values?.reduce((acc = 0, value) => acc + (value ?? 0), 0);
  },
};

export const median: GridAggregationApplierFunction<number> = {
  label: 'Median',
  footerLabel: 'median',
  apply: (values) => {
    const sortedValues = values.filter((v) => v != null).sort((a, b) => a - b);
    const count = sortedValues.length;
    if (count === 0) {
      return 0;
    }
    const half = Math.floor(count / 2);
    if (count % 2 === 0) {
      return (sortedValues[half - 1] + sortedValues[half]) / 2;
    }
    return sortedValues[half];
  },
  valueFormatter: (value) => round(value, 2),
};

export const defaultAggregationFunctions = {
  sum,
  max,
  min,
  avg,
  count,
  distinct,
  median,
};

const round = (value: number, precision: number) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};
