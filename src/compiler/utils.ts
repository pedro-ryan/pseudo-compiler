/**
 * @param {Object} obj
 * We'll make assumptions about path in order to avoid reimplementing
 * https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore/issues/395#issuecomment-1986928203
 * @param {Array|string} path
 * @param {*} value
 * @returns {Object} Returns obj
 */
export function set(
  obj: object,
  path: (string | number)[] | string,
  value: unknown
): object {
  path = Array.isArray(path) ? path.join(".") : path;
  const paths = path
    .split(".")
    .map((p) => (isNaN(parseInt(p, 10)) ? p : parseInt(p, 10)));
  const lastIndex = paths.length - 1;

  let nested = obj as Record<string | number, unknown>;
  for (const [i, p] of paths.entries()) {
    if (i === lastIndex) {
      nested[p] = value;
    } else {
      if (nested[p]) {
        nested = nested[p] as Record<string | number, unknown>;
      } else {
        const a = (nested[p] = typeof paths[i + 1] === "number" ? [] : {});
        (nested as object) = a;
      }
    }
  }
  return obj;
}

export function get(
  obj: object,
  path: string | (string | number)[],
  defaultValue = undefined
) {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce(
        (res, key) =>
          res !== null && res !== undefined
            ? ((res as Record<string, unknown>)[key] as object)
            : res,
        obj
      );
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
}
