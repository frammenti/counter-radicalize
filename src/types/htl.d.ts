declare module 'htl' {
  export function html(strings: TemplateStringsArray, ...values: any[]): HTMLElement;
  export function svg(strings: TemplateStringsArray, ...values: any[]): SVGElement;
}