import { expect, it } from "vitest";
import { checkPackingItem, packingProgress, validPackingList, type PackingList } from "../src/model/packing";
import { validTravelResponse } from "../src/model/contracts";
const id = (value: number) => `${String(value).padStart(8, "0")}-1111-4111-8111-111111111111`;
const list: PackingList = { version: 3, people: [
  { id: id(1), name: "Example traveler", groups: [{ id: id(2), name: "Hygiene", items: [
    { id: id(3), name: "Toothbrush", checked: false }, { id: id(4), name: "Soap", checked: true },
  ] }] },
  { id: id(5), name: "Second traveler", groups: [{ id: id(6), name: "Clothes", items: [{ id: id(7), name: "Shirt", checked: true }] }] },
] };
it("changes one check immutably and derives group, person and total progress", () => {
  const changed = checkPackingItem(list, id(1), id(2), id(3), true);
  expect(changed.people[0].groups[0].items[0].checked).toBe(true);
  expect(list.people[0].groups[0].items[0].checked).toBe(false);
  expect(changed.people[1]).toBe(list.people[1]);
  expect(changed.version).toBe(3);
  expect(packingProgress(list.people[0].groups[0].items)).toEqual({ checked: 1, total: 2 });
  expect(packingProgress(changed.people.flatMap(p => p.groups.flatMap(g => g.items)))).toEqual({ checked: 3, total: 3 });
  expect(packingProgress([])).toEqual({ checked: 0, total: 0 });
});
it("validates packing responses before rendering, including saved unchecked values", () => {
  expect(validTravelResponse(`/${id(8)}/packing`, "GET", list)).toBe(true);
  expect(validTravelResponse(`/${id(8)}/packing`, "PUT", list)).toBe(true);
  expect(validPackingList({ version: 0, people: [] })).toBe(true);
  expect(validPackingList({ ...list, version: -1 })).toBe(false);
  expect(validPackingList({ ...list, people: [...list.people, list.people[0]] })).toBe(false);
  for (const checked of ["true", null, 1, undefined]) {
    const invalid = { version: 0, people: [{ id: id(1), name: "Example", groups: [{ id: id(2), name: "Group", items: [{ id: id(3), name: "Item", checked }] }] }] };
    expect(validPackingList(invalid)).toBe(false);
  }
  expect(validPackingList({ version: 0, people: [{ id: id(1), name: " ", groups: [] }] })).toBe(false);
});
