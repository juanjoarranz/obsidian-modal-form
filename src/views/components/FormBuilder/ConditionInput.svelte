<script lang="ts">
    import { input } from "@core";
    import { A, O, pipe } from "@std";
    import { FieldDefinition } from "src/core/formDefinition";
    import FormRow from "../FormRow.svelte";
    import { getInitialInputValues, makeModel } from "./ConditionInput";

    export let siblingFields: FieldDefinition[];
    export let name: string;
    export let condition: input.Condition;
    export let onChange: (condition: input.Condition) => void;
    export let onRemove: (() => void) | undefined = undefined;
    export let showRemove: boolean = false;
    const model = makeModel(siblingFields, condition, onChange);
    $: conditions = model.conditionTypeOptions;
    $: conditionType = model.conditionType;
    $: dependencyName = model.dependencyName;
    $: valueField = model.valueField;
    $: console.log(name, $conditions, $dependencyName, $valueField);
    let { booleanValue, numberValue, textValue } = getInitialInputValues(condition);
    $: {
        pipe(
            $conditions,
            O.chain((conditions) =>
                // if the current condition is not in the list of available conditions, set it to the first available condition
                conditions.includes($conditionType) ? O.none : A.head(conditions),
            ),
            O.map((newVAlue) => {
                $conditionType = newVAlue;
            }),
        );
        if (O.isSome($valueField)) {
            // By the time we are able to set a value, the condition is complete so we can submit it
            // Using each of the set functions will ensure type safety
            if ($valueField.value.type === "dropdown") $valueField.value.set(booleanValue);
            if ($valueField.value.type === "text") $valueField.value.set(textValue);
            if ($valueField.value.type === "number") $valueField.value.set(numberValue);
        }
    }
    $: {
        if ($conditionType === "isSet") {
            // This is the only case where we can submit a condition without a value
            if ($dependencyName !== condition.dependencyName && $dependencyName !== undefined)
                onChange({ type: "isSet", dependencyName: $dependencyName });
        }
    }
</script>

<div class="condition-input-wrapper">
    <FormRow label="When field" id="sibling-field-of-{name}">
        <select bind:value={$dependencyName} class="dropdown">
            {#each siblingFields as field}
                <option value={field.name}
                    >{field.name}
                    {#if field.label}
                        ({field.label})
                    {/if}
                </option>
            {/each}
        </select>
    </FormRow>

    {#if O.isSome($conditions)}
        <FormRow label="Condition" id="condition-{name}">
            <select class="dropdown" bind:value={$conditionType}>
                {#each $conditions.value as option}
                    <option value={option}>
                        {option}
                    </option>
                {/each}
            </select>
        </FormRow>
    {/if}
    {#if O.isSome($valueField)}
        <FormRow label="Value" id="condition-value-{name}">
            {#if $valueField.value.type === "text"}
                <input type="text" class="input" bind:value={textValue} />
            {:else if $valueField.value.type === "number"}
                <input type="number" class="input" bind:value={numberValue} />
            {:else if $valueField.value.type === "dropdown"}
                <select class="dropdown" bind:value={booleanValue}>
                    {#each $valueField.value.options as option}
                        <option value={option}>{option}</option>
                    {/each}
                </select>
            {/if}
        </FormRow>
    {/if}
    {#if showRemove && onRemove}
        <button class="remove-condition-btn" type="button" on:click={onRemove} aria-label="Remove condition">
            ✕
        </button>
    {/if}
</div>

<style>
    .condition-input-wrapper {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 0.5rem;
    }
    .remove-condition-btn {
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
        cursor: pointer;
        color: var(--text-muted);
        background: transparent;
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
    }
    .remove-condition-btn:hover {
        color: var(--text-error);
        border-color: var(--text-error);
    }
</style>
