import { describe, it, expect } from 'vitest';
import { getRootBoardGrid, CORE_BOARD_ITEMS, CATEGORY_FOLDERS } from '../data/coreBoard';

describe('AAC Motor Planning & Fixed Board Grid Positions', () => {
  it('adult grid has exactly 40 fixed slots', () => {
    const gridLevel3 = getRootBoardGrid('adult', 3);
    expect(gridLevel3).toHaveLength(40);
  });

  it('student grid has exactly 35 fixed slots', () => {
    const gridLevel3 = getRootBoardGrid('student', 3);
    expect(gridLevel3).toHaveLength(35);
  });

  it('child grid has exactly 20 fixed slots', () => {
    const gridLevel3 = getRootBoardGrid('child', 3);
    expect(gridLevel3).toHaveLength(20);
  });

  it('never shifts or reflows card positions when lowering vocabulary level', () => {
    // Motor planning requirement: cards in Level 1 must be in the EXACT same slot in Level 3
    const childL1 = getRootBoardGrid('child', 1);
    const childL2 = getRootBoardGrid('child', 2);
    const childL3 = getRootBoardGrid('child', 3);

    expect(childL1).toHaveLength(20);
    expect(childL2).toHaveLength(20);
    expect(childL3).toHaveLength(20);

    // Any populated slot in Level 1 must have the identical item in Level 2 and Level 3
    childL1.forEach((item, slotIndex) => {
      if (item !== null) {
        expect(childL2[slotIndex]?.id).toBe(item.id);
        expect(childL3[slotIndex]?.id).toBe(item.id);
      }
    });

    // Level 1 must have locked slots as null (not shifted)
    const emptyCountL1 = childL1.filter(item => item === null).length;
    const emptyCountL3 = childL3.filter(item => item === null).length;
    expect(emptyCountL1).toBeGreaterThan(emptyCountL3);

    // Same check for adult
    const adultL1 = getRootBoardGrid('adult', 1);
    const adultL3 = getRootBoardGrid('adult', 3);
    expect(adultL1).toHaveLength(40);
    expect(adultL3).toHaveLength(40);

    adultL1.forEach((item, slotIndex) => {
      if (item !== null) {
        expect(adultL3[slotIndex]?.id).toBe(item.id);
      }
    });
  });

  it('no duplicate slots exist for the same userMode in root items', () => {
    const adultSlots = new Set<number>();
    CORE_BOARD_ITEMS.forEach(item => {
      if (item.adultSlot >= 0 && item.adultSlot < 40) {
        expect(adultSlots.has(item.adultSlot)).toBe(false);
        adultSlots.add(item.adultSlot);
      }
    });

    const studentSlots = new Set<number>();
    CORE_BOARD_ITEMS.forEach(item => {
      if (item.studentSlot >= 0 && item.studentSlot < 35) {
        expect(studentSlots.has(item.studentSlot)).toBe(false);
        studentSlots.add(item.studentSlot);
      }
    });

    const childSlots = new Set<number>();
    CORE_BOARD_ITEMS.forEach(item => {
      if (item.childSlot >= 0 && item.childSlot < 20) {
        expect(childSlots.has(item.childSlot)).toBe(false);
        childSlots.add(item.childSlot);
      }
    });
  });

  it('includes core folders with valid category sub-boards', () => {
    expect(Object.keys(CATEGORY_FOLDERS).length).toBeGreaterThanOrEqual(12);
    expect(CATEGORY_FOLDERS['food']).toBeDefined();
    expect(CATEGORY_FOLDERS['drinks']).toBeDefined();
    expect(CATEGORY_FOLDERS['feelings']).toBeDefined();
    expect(CATEGORY_FOLDERS['body_health']).toBeDefined();
    expect(CATEGORY_FOLDERS['school']).toBeDefined();
    expect(CATEGORY_FOLDERS['home']).toBeDefined();
  });
});
