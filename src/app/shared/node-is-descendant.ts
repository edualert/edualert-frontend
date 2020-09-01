
// Check if the target of this event is a descendant of the provided ancestor.
export function nodeIsDescendant(ancestor: HTMLElement, event: any) {
  if (!event) {
    return true;
  }

  if (event.composedPath) {
    return (event.composedPath().includes(ancestor));
  }
  if (event.deepPath) {
    return (event.deepPath().includes(ancestor));
  }

  let node = event.target.parentNode;
  while (node !== null) {
    if (node === ancestor) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}
