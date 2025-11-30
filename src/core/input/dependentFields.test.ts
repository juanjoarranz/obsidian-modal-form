import { input } from "@core";
import * as v from "valibot";
import { FieldDefinition } from "../formDefinition";
import * as deps from "./dependentFields";
import { ConditionSchema, ConditionOrConditionsSchema } from "./dependentFields";

describe("dependentFields", () => {
    it("should return a list of conditions available for the input type: 'text'", () => {
        const field: FieldDefinition["input"] = {
            type: "text",
            hidden: false,
        };
        const types = input.availableConditionsForInput(field);
        types.forEach((type) => {
            const value = { type, dependencyName: "test-field", value: "test" };
            const parsed = v.safeParse(ConditionSchema, value);
            expect(parsed.success).toBe(true);
        });
        expect.assertions(types.length);
    });
    it("should return true if the value is set", () => {
        const condition: input.Condition = {
            type: "isSet",
            dependencyName: "test-field",
        };
        expect(deps.valueMeetsCondition(condition, "test")).toBe(true);
        expect(deps.valueMeetsCondition(condition, 0)).toBe(true);
        expect(deps.valueMeetsCondition(condition, true)).toBe(true);
        expect(deps.valueMeetsCondition(condition, false)).toBe(true);
    });
    it("should return false if the value is not set", () => {
        const condition: input.Condition = {
            type: "isSet",
            dependencyName: "test-field",
        };
        expect(deps.valueMeetsCondition(condition, "")).toBe(false);
    });
    it("should handle the boolean condition", () => {
        const condition: input.Condition = {
            type: "boolean",
            value: true,
            dependencyName: "test-field",
        };
        expect(deps.valueMeetsCondition(condition, true)).toBe(true);
        expect(deps.valueMeetsCondition(condition, false)).toBe(false);
    });
    it('should handle the isSet conditions for "null" and "undefined"', () => {
        const condition: input.Condition = {
            type: "isSet",
            dependencyName: "test-field",
        };
        expect(deps.valueMeetsCondition(condition, null)).toBe(false);
        expect(deps.valueMeetsCondition(condition, undefined)).toBe(false);
        expect(deps.valueMeetsCondition(condition, "")).toBe(false);
    });
    it("should properly handle all string conditions that are true", () => {
        const conditions: [input.Condition, string][] = [
            [{ type: "startsWith", dependencyName: "test-field", value: "test" }, "test starts"],
            [{ type: "endsWith", dependencyName: "test-field", value: "test" }, "ends with test"],
            [{ type: "isExactly", dependencyName: "test-field", value: "test" }, "test"],
            [
                { type: "contains", dependencyName: "test-field", value: "test" },
                "contains test somewhere",
            ],
        ];
        conditions.forEach(([condition, value]) => {
            expect(deps.valueMeetsCondition(condition, value)).toBe(true);
        });
        expect.assertions(conditions.length);
    });
    it("should properly handle all string conditions that are false", () => {
        const conditions: [input.Condition, unknown][] = [
            [{ type: "startsWith", dependencyName: "test-field", value: "test" }, "not test"],
            [{ type: "startsWith", dependencyName: "test-field", value: "test" }, null],
            [
                { type: "endsWith", dependencyName: "test-field", value: "test" },
                "not test at the end",
            ],
            [
                { type: "isExactly", dependencyName: "test-field", value: "test" },
                "not exactly test",
            ],
            [
                { type: "contains", dependencyName: "test-field", value: "test" },
                "does not contain tst",
            ],
        ];
        conditions.forEach(([condition, value]) => {
            expect(deps.valueMeetsCondition(condition, value)).toBe(false);
        });
        expect.assertions(conditions.length);
    });
    it("should properly handle all number conditions that are true", () => {
        const conditions: [input.Condition, unknown][] = [
            [{ type: "above", dependencyName: "test", value: 5 }, 6],
            [{ type: "aboveOrEqual", dependencyName: "test", value: 5 }, 5],
            [{ type: "aboveOrEqual", dependencyName: "test", value: 5 }, 8],
            [{ type: "below", dependencyName: "test", value: 5 }, 4],
            [{ type: "below", dependencyName: "test", value: 5 }, -4],
            [{ type: "belowOrEqual", dependencyName: "test", value: 5 }, 5],
            [{ type: "belowOrEqual", dependencyName: "test", value: 5 }, 2],
            [{ type: "exactly", dependencyName: "test", value: 5 }, 5],
        ];
        conditions.forEach(([condition, value]) => {
            expect(deps.valueMeetsCondition(condition, value)).toBe(true);
        });
        expect.assertions(conditions.length);
    });
    it("should properly handle all number conditions that are false", () => {
        const conditions: [input.Condition, unknown][] = [
            [{ type: "above", dependencyName: "test", value: 5 }, 4],
            [{ type: "aboveOrEqual", dependencyName: "test", value: 5 }, 4],
            [{ type: "below", dependencyName: "test", value: 5 }, 6],
            [{ type: "belowOrEqual", dependencyName: "test", value: 5 }, 6],
            [{ type: "exactly", dependencyName: "test", value: 5 }, 4],
            [{ type: "exactly", dependencyName: "test", value: 5 }, null],
            [{ type: "exactly", dependencyName: "test", value: 5 }, undefined],
            [{ type: "exactly", dependencyName: "test", value: 5 }, {}],
        ];
        conditions.forEach(([condition, value]) => {
            expect(deps.valueMeetsCondition(condition, value)).toBe(false);
        });
        expect.assertions(conditions.length);
    });
});

describe("normalizeConditions", () => {
    it("should return an empty array for undefined", () => {
        expect(deps.normalizeConditions(undefined)).toEqual([]);
    });

    it("should return an array with the single condition for a single condition", () => {
        const condition: input.Condition = {
            type: "isSet",
            dependencyName: "test-field",
        };
        expect(deps.normalizeConditions(condition)).toEqual([condition]);
    });

    it("should return the array as-is for an array of conditions", () => {
        const conditions: input.Condition[] = [
            { type: "isSet", dependencyName: "field1" },
            { type: "isExactly", dependencyName: "field2", value: "test" },
        ];
        expect(deps.normalizeConditions(conditions)).toEqual(conditions);
    });

    it("should return an empty array for an empty array", () => {
        expect(deps.normalizeConditions([])).toEqual([]);
    });
});

describe("valuesMeetConditions", () => {
    it("should return true for a single condition that is met", () => {
        const condition: input.Condition = {
            type: "isSet",
            dependencyName: "field1",
        };
        const formValues = { field1: "value" };
        expect(deps.valuesMeetConditions(condition, formValues)).toBe(true);
    });

    it("should return false for a single condition that is not met", () => {
        const condition: input.Condition = {
            type: "isSet",
            dependencyName: "field1",
        };
        const formValues = { field1: "" };
        expect(deps.valuesMeetConditions(condition, formValues)).toBe(false);
    });

    it("should return true when all conditions in an array are met", () => {
        const conditions: input.Condition[] = [
            { type: "isSet", dependencyName: "field1" },
            { type: "isExactly", dependencyName: "field2", value: "specific" },
            { type: "above", dependencyName: "field3", value: 10 },
        ];
        const formValues = {
            field1: "value",
            field2: "specific",
            field3: 15,
        };
        expect(deps.valuesMeetConditions(conditions, formValues)).toBe(true);
    });

    it("should return false when any condition in an array is not met", () => {
        const conditions: input.Condition[] = [
            { type: "isSet", dependencyName: "field1" },
            { type: "isExactly", dependencyName: "field2", value: "specific" },
            { type: "above", dependencyName: "field3", value: 10 },
        ];
        // field2 does not match
        const formValues = {
            field1: "value",
            field2: "wrong",
            field3: 15,
        };
        expect(deps.valuesMeetConditions(conditions, formValues)).toBe(false);
    });

    it("should return false when the first condition fails", () => {
        const conditions: input.Condition[] = [
            { type: "isSet", dependencyName: "field1" },
            { type: "isExactly", dependencyName: "field2", value: "specific" },
        ];
        const formValues = {
            field1: "",  // not set
            field2: "specific",
        };
        expect(deps.valuesMeetConditions(conditions, formValues)).toBe(false);
    });

    it("should return false when the last condition fails", () => {
        const conditions: input.Condition[] = [
            { type: "isSet", dependencyName: "field1" },
            { type: "isExactly", dependencyName: "field2", value: "specific" },
        ];
        const formValues = {
            field1: "value",
            field2: "not-specific",
        };
        expect(deps.valuesMeetConditions(conditions, formValues)).toBe(false);
    });

    it("should return true for an empty array of conditions", () => {
        const conditions: input.Condition[] = [];
        const formValues = { field1: "value" };
        expect(deps.valuesMeetConditions(conditions, formValues)).toBe(true);
    });

    it("should return false when dependency field is missing from formValues", () => {
        const conditions: input.Condition[] = [
            { type: "isSet", dependencyName: "nonexistent" },
        ];
        const formValues = { field1: "value" };
        expect(deps.valuesMeetConditions(conditions, formValues)).toBe(false);
    });
});

describe("ConditionOrConditionsSchema", () => {
    it("should validate a single condition", () => {
        const condition = { type: "isSet", dependencyName: "field1" };
        const result = v.safeParse(ConditionOrConditionsSchema, condition);
        expect(result.success).toBe(true);
    });

    it("should validate an array of conditions", () => {
        const conditions = [
            { type: "isSet", dependencyName: "field1" },
            { type: "isExactly", dependencyName: "field2", value: "test" },
        ];
        const result = v.safeParse(ConditionOrConditionsSchema, conditions);
        expect(result.success).toBe(true);
    });

    it("should validate a single-item array of conditions", () => {
        const conditions = [{ type: "isSet", dependencyName: "field1" }];
        const result = v.safeParse(ConditionOrConditionsSchema, conditions);
        expect(result.success).toBe(true);
    });

    it("should validate an empty array", () => {
        const result = v.safeParse(ConditionOrConditionsSchema, []);
        expect(result.success).toBe(true);
    });

    it("should reject invalid condition types", () => {
        const invalid = { type: "invalidType", dependencyName: "field1" };
        const result = v.safeParse(ConditionOrConditionsSchema, invalid);
        expect(result.success).toBe(false);
    });

    it("should reject arrays with invalid conditions", () => {
        const conditions = [
            { type: "isSet", dependencyName: "field1" },
            { type: "invalidType", dependencyName: "field2" },
        ];
        const result = v.safeParse(ConditionOrConditionsSchema, conditions);
        expect(result.success).toBe(false);
    });
});
