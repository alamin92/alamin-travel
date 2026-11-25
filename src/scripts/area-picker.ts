// Cascading "where" picker: country > state > region > base town.
// A level with only one choice is hidden, so today the visitor sees region and town only.
// When a second state or country is added to the data, its select appears by itself.
export interface PickerHub { id: string; name: string; country: string; state: string; region: string; alsoRegions: string[] }
export interface PickerTree { id: string; name: string; states: { code: string; name: string; regions: { id: string; name: string }[] }[] }
interface Opt { value: string; label: string }

export function wireAreaPicker(root: HTMLElement) {
  const { tree, hubs } = JSON.parse(root.querySelector('script.area-data')!.textContent!) as { tree: PickerTree[]; hubs: PickerHub[] };
  const get = (l: string) => root.querySelector<HTMLSelectElement>(`select[data-level="${l}"]`)!;
  const country = get('country'), state = get('state'), region = get('region'), hub = get('hub');

  const inRegion = (h: PickerHub, id: string) => h.region === id || h.alsoRegions.includes(id);
  function fill(el: HTMLSelectElement, opts: Opt[], want: string, anyLabel?: string) {
    const all = anyLabel ? [{ value: '', label: anyLabel }, ...opts] : opts;
    el.replaceChildren(...all.map((o) => new Option(o.label, o.value)));
    el.value = all.some((o) => o.value === want) ? want : all[0]?.value ?? '';
    // Hide a level that has nothing to choose (never hide the town list).
    if (el !== hub) (el.closest('label') as HTMLElement).hidden = opts.length <= 1;
  }

  function build(want: { country?: string; state?: string; region?: string; hub?: string } = {}) {
    const cs = tree.filter((c) => hubs.some((h) => h.country === c.id));
    fill(country, cs.map((c) => ({ value: c.id, label: c.name })), want.country ?? country.value);
    const c = cs.find((x) => x.id === country.value);
    const ss = (c?.states ?? []).filter((s) => hubs.some((h) => h.country === c!.id && h.state === s.code));
    fill(state, ss.map((s) => ({ value: s.code, label: s.name })), want.state ?? state.value);
    const s = ss.find((x) => x.code === state.value);
    const scope = hubs.filter((h) => h.country === country.value && h.state === state.value);
    const rs = (s?.regions ?? []).filter((r) => scope.some((h) => inRegion(h, r.id)));
    fill(region, rs.map((r) => ({ value: r.id, label: r.name })), want.region ?? region.value, 'Any region');
    const list = region.value ? scope.filter((h) => inRegion(h, region.value)) : scope;
    hub.replaceChildren(new Option('Choose a base town', ''));
    if (region.value) {
      list.forEach((h) => hub.append(new Option(h.name, h.id)));
    } else {
      for (const r of rs) {
        const g = document.createElement('optgroup'); g.label = r.name;
        list.filter((h) => h.region === r.id).forEach((h) => g.append(new Option(h.name, h.id)));
        if (g.children.length) hub.append(g);
      }
    }
    if (want.hub && list.some((h) => h.id === want.hub)) hub.value = want.hub;
  }

  country.addEventListener('change', () => build({ state: '', region: '' }));
  state.addEventListener('change', () => build({ region: '' }));
  region.addEventListener('change', () => build());
  build();

  return {
    setHub(id: string) {
      const h = hubs.find((x) => x.id === id);
      if (h) build({ country: h.country, state: h.state, region: '', hub: id });
    },
  };
}
