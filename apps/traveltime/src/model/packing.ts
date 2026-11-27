import type { components } from "@oskar-lab/api/backend";

export type PackingList = components["schemas"]["PackingList"];
export type PackingPerson = PackingList["people"][number];
export type PackingGroup = PackingPerson["groups"][number];
export type PackingItem = PackingGroup["items"][number];

/** Counts saved or draft checks without storing redundant progress values. */
export function packingProgress(items: readonly PackingItem[]): { checked: number; total: number } {
  return { checked: items.filter(item => item.checked).length, total: items.length };
}

/** Checks the bounded API tree, including globally unique IDs and exact checkbox types. */
export function validPackingList(value: unknown): value is PackingList {
  const object = (item: unknown): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item));
  const ids = new Set<string>();
  const node = (item: unknown, limit: number): item is Record<string, unknown> => {
    if (!object(item) || typeof item.id !== "string" || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(item.id) || ids.has(item.id.toLowerCase())) return false;
    ids.add(item.id.toLowerCase());
    return typeof item.name === "string" && Boolean(item.name.trim()) && item.name.length <= limit;
  };
  let groups = 0, items = 0;
  return object(value) && Number.isSafeInteger(value.version) && Number(value.version) >= 0 &&
    Array.isArray(value.people) && value.people.length <= 12 && value.people.every(person => {
      if (!node(person, 80) || !Array.isArray(person.groups) || person.groups.length > 40) return false;
      groups += person.groups.length;
      return person.groups.every(group => {
        if (!node(group, 100) || !Array.isArray(group.items) || group.items.length > 100) return false;
        items += group.items.length;
        return group.items.every(item => node(item, 200) && typeof item.checked === "boolean");
      });
    }) && groups <= 100 && items <= 500;
}

/** Changes only one person's checkbox, preserving IDs, order, metadata and other people's checks. */
export function checkPackingItem(list: PackingList, personId: string, groupId: string, itemId: string, checked: boolean): PackingList {
  return { ...list, people: list.people.map(person => person.id !== personId ? person : {
    ...person, groups: person.groups.map(group => group.id !== groupId ? group : {
      ...group, items: group.items.map(item => item.id === itemId ? { ...item, checked } : item),
    }),
  }) };
}
