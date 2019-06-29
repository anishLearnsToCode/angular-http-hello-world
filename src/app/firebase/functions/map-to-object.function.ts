export function mapToObject<A>(array: Array<{[key: string]: A}>) {
  const posts  = [];
  // tslint:disable-next-line:forin
  for (const key in array) {
    posts.push({...array[key], key});
  }
  return posts;
}
