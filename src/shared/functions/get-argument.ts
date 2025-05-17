export function getArgument(argv: string[], name: string): string {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 ? argv[i + 1]?.toLowerCase() : '';
}