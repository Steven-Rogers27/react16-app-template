function htmlEncodeWithLineBreak(t: string): string {
  const div: HTMLDivElement = document.createElement('div');
  const segs: string[] = t.split('\n');
  let res: string = '';
  for (let i = 0, len = segs.length; i < len; i++) {
    div.innerText = segs[i];
    res += div.innerHTML;
    if (i < len - 1) {
      res += '\n';
    }
  }
  return res;
}

export function htmlEncode(text: string): string {
  const div: HTMLDivElement = document.createElement('div');
  if (text.includes('\n')) {
    return htmlEncodeWithLineBreak(text);
  }
  div.innerText = text;
  return div.innerHTML;
}

export function htmlDecode(text: string): string {
  const div: HTMLDivElement = document.createElement('div');
  div.innerHTML = text;
  return div.innerText;
}