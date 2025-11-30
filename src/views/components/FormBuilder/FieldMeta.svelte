<script lang="ts">
    import { input } from "@core";
    import { EditableField, FieldDefinition } from "src/core/formDefinition";
    import { slide } from "svelte/transition";
    import FormRow from "../FormRow.svelte";
    import Toggle from "../Toggle.svelte";
    import ConditionInput from "./ConditionInput.svelte";
    export let field: EditableField;
    export let availableFieldsForCondition: FieldDefinition[];
    export let index: number;
    
    // Normalize conditions to always work with arrays internally
    function getConditionsArray(): input.Condition[] {
        if (!field.condition) return [];
        if (Array.isArray(field.condition)) return field.condition;
        return [field.condition];
    }
    
    let isConditional = !!field.condition && getConditionsArray().length > 0;
    $: conditions = getConditionsArray();
    $: availableConditions = availableFieldsForCondition.filter((x) => x.name !== field.name);
    $: {
        if (isConditional) {
            // Initialize with an array containing one default condition if empty
            if (!field.condition || getConditionsArray().length === 0) {
                field.condition = [{ dependencyName: "", type: "isSet" }];
            }
        } else {
            field.condition = undefined;
        }
    }
    
    function addCondition() {
        const currentConditions = getConditionsArray();
        field.condition = [...currentConditions, { dependencyName: "", type: "isSet" }];
    }
    
    function removeCondition(conditionIndex: number) {
        const currentConditions = getConditionsArray();
        if (currentConditions.length <= 1) {
            // If removing the last condition, disable conditional
            isConditional = false;
            field.condition = undefined;
        } else {
            field.condition = currentConditions.filter((_, i) => i !== conditionIndex);
        }
    }
    
    function updateCondition(conditionIndex: number, newCondition: input.Condition) {
        const currentConditions = getConditionsArray();
        field.condition = currentConditions.map((c, i) => 
            i === conditionIndex ? newCondition : c
        );
    }
</script>

{#if availableConditions.length > 0}
    <div class="flex gap-2" transition:slide>
        <FormRow label="Conditional" id={`conditional-${index}`}>
            <Toggle bind:checked={isConditional} tabindex={index} />
        </FormRow>
        {#if field.condition !== undefined && conditions.length > 0}
            <div class="conditions-container" transition:slide>
                {#each conditions as condition, conditionIndex (conditionIndex)}
                    <div class="condition-row flex gap-2" transition:slide>
                        <ConditionInput
                            siblingFields={availableConditions}
                            name={field.name}
                            {condition}
                            onChange={(newCondition) => updateCondition(conditionIndex, newCondition)}
                            onRemove={() => removeCondition(conditionIndex)}
                            showRemove={conditions.length > 1}
                        />
                    </div>
                    {#if conditionIndex < conditions.length - 1}
                        <div class="condition-separator">AND</div>
                    {/if}
                {/each}
                <button class="add-condition-btn" type="button" on:click={addCondition}>
                    + Add condition
                </button>
            </div>
        {/if}
    </div>
{/if}

<style>
    .conditions-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .condition-row {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
    }
    .condition-separator {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        padding: 0.25rem 0;
        text-align: center;
    }
    .add-condition-btn {
        margin-top: 0.5rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
        cursor: pointer;
    }
</style>
