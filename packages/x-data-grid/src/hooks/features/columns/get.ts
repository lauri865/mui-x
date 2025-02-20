import { GridValidRowModel } from '../../../models';

export function get(obj: GridValidRowModel, path: string) {
  if (!obj || !path) {
    return;
  }
  if (obj[path] !== undefined) {
    return obj[path];
  }
  const props = path.split('.');
  let prop: string;
  while (props.length) {
    prop = props.shift() as string;
    if (!obj) {
      return;
    }
    obj = obj[prop];
    if (obj === undefined) {
      return;
    }
  }
  return obj;
}
