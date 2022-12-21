export const toClassName = (className: string) => `ms-${className}`;
export const toCssVar = (name: string) => `--ms-${name}`;

export type Falsy = boolean | undefined | null | 0;

export function classNames(...classes: (string | Falsy)[]) {
  return classes.filter(Boolean).join(" ").trim();
}
