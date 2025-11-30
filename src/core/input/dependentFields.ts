import { Str } from "@std";
import * as Eq from "fp-ts/Eq";
import { absurd } from "fp-ts/function";
import * as v from "valibot";
import { FieldDefinition } from "../formDefinition";
const isSet = v.object({ dependencyName: v.string(), type: v.literal("isSet") });
const booleanValue = v.object({
    dependencyName: v.string(),
    type: v.literal("boolean"),
    value: v.boolean(),
});
const startsWith = v.object({
    dependencyName: v.string(),
    type: v.enumType(["startsWith", "endsWith", "isExactly", "contains"]),
    value: v.string(),
});
const above = v.object({
    dependencyName: v.string(),
    type: v.enumType(["above", "aboveOrEqual", "below", "belowOrEqual", "exactly"]),
    value: v.number(),
});
export const ConditionSchema = v.union([isSet, booleanValue, startsWith, above]);
export const ConditionOrConditionsSchema = v.union([ConditionSchema, v.array(ConditionSchema)]);

export type Condition = v.Output<typeof ConditionSchema>;
export type ConditionOrConditions = v.Output<typeof ConditionOrConditionsSchema>;
export type ConditionType = Condition["type"];

export const ConditionEq = Eq.struct({
    dependencyName: Str.Eq,
    type: Str.Eq,
    value: Str.Eq,
});

export function availableConditionsForInput(input: FieldDefinition["input"]): ConditionType[] {
    switch (input.type) {
        case "text":
        case "textarea":
        case "email":
        case "folder":
        case "note":
        case "tel":
            return ["isSet", "startsWith", "endsWith", "isExactly", "contains"];
        case "slider":
        case "number":
            return ["isSet", "above", "aboveOrEqual", "below", "belowOrEqual", "exactly"];
        case "toggle":
            return ["boolean"];
        case "date":
        case "time":
        case "datetime":
            return ["isSet"];
        // Select values are always set, so that's why we don't have an "isSet" condition
        case "select":
            return ["startsWith", "endsWith", "isExactly", "contains"];
        case "multiselect":
        case "tag":
        case "dataview":
        case "document_block":
        case "markdown_block":
            return [];
        case "image":
        case "file":
            return ["isSet"];
        default:
            return absurd(input);
    }
}

function processIsSet(_condition: Extract<Condition, { type: "isSet" }>, value: unknown) {
    if (value === null || value === undefined) {
        return false;
    }
    if (typeof value === "string") {
        return value !== "";
    }
    return true;
}

function processStringCondition(
    condition: Extract<Condition, { type: "startsWith" | "contains" | "endsWith" | "isExactly" }>,
    value: unknown,
): boolean {
    if (typeof value !== "string") {
        return false;
    }
    switch (condition.type) {
        case "startsWith":
            return value.startsWith(condition.value);
        case "contains":
            return value.includes(condition.value);
        case "endsWith":
            return value.endsWith(condition.value);
        case "isExactly":
            return value === condition.value;
        default:
            return absurd(condition.type);
    }
}

function processNumberCondition(
    condition: Extract<
        Condition,
        { type: "above" | "below" | "aboveOrEqual" | "belowOrEqual" | "exactly" }
    >,
    value: unknown,
): boolean {
    if (typeof value !== "number") {
        return false;
    }
    switch (condition.type) {
        case "above":
            return value > condition.value;
        case "below":
            return value < condition.value;
        case "aboveOrEqual":
            return value >= condition.value;
        case "belowOrEqual":
            return value <= condition.value;
        case "exactly":
            return value === condition.value;
        default:
            return absurd(condition.type);
    }
}

export function valueMeetsCondition(condition: Condition, value: unknown): boolean {
    switch (condition.type) {
        case "isSet":
            return processIsSet(condition, value);
        case "startsWith":
        case "contains":
        case "endsWith":
        case "isExactly":
            return processStringCondition(condition, value);
        case "above":
        case "below":
        case "aboveOrEqual":
        case "belowOrEqual":
        case "exactly":
            return processNumberCondition(condition, value);
        case "boolean":
            return value === condition.value;
        default:
            return absurd(condition);
    }
}

/**
 * Normalizes a condition or array of conditions to always return an array.
 * If undefined, returns an empty array.
 * If a single condition, returns an array with that condition.
 * If already an array, returns it as-is.
 */
export function normalizeConditions(condition: ConditionOrConditions | undefined): Condition[] {
    if (condition === undefined) {
        return [];
    }
    if (Array.isArray(condition)) {
        return condition;
    }
    return [condition];
}

/**
 * Checks if all conditions are met by the form values.
 * Uses AND logic: all conditions must pass for the function to return true.
 * 
 * @param conditions - A single condition or array of conditions to evaluate.
 *                     Empty arrays result in true (no conditions = all met).
 * @param formValues - Record of field names to their current values.
 * @returns true if all conditions are met, false otherwise.
 */
export function valuesMeetConditions(
    conditions: ConditionOrConditions,
    formValues: Record<string, unknown>,
): boolean {
    const normalizedConditions = normalizeConditions(conditions);
    return normalizedConditions.every((condition) =>
        valueMeetsCondition(condition, formValues[condition.dependencyName]),
    );
}
