type Primitive = string | number | boolean | null

type YAMLValue =
  | Primitive
  | YAML
  | YAMLValue[]

interface YAML {
  [key: string]: YAMLValue
}

declare module '*.yaml' {
  const content: YAML
  export default content
}
declare module '*.yml' {
  const content: YAML
  export default content
}
