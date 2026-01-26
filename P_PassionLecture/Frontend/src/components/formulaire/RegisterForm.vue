<template>
  <form @submit.prevent="onSubmit">
    <div v-for="(field, idx) in fields" :key="idx" class="form-group">
      <label :for="field.name">{{ field.label }}</label>

      <!-- input texte / password / email etc. -->
      <input
        :type="field.type || 'text'"
        :id="field.name"
        v-model="formData[field.name]"
        :placeholder="field.placeholder || ''"
        class="form-input"
      />
    </div>

    <button type="submit" class="btn-submit">S'enregistrer</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  fields: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['submit'])

const formData = reactive({})

// Initialisation
props.fields.forEach((field) => {
  formData[field.name] = ''
})

function onSubmit() {
  emit('submit', { ...formData })
}
</script>

<style scoped>
.form-group {
  margin-bottom: 18px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #bcd4f5;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: 0.2s;
}

.form-input:focus {
  border-color: #0097ff;
  box-shadow: 0 0 6px rgba(0, 151, 255, 0.4);
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 15px;
  color: #1a1a1a;
  font-weight: 600;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  background: #12a5ff;
  color: #fff;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: 0.15s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.25);
}

.btn-submit:hover {
  background: #0c8ad4;
  transform: translateY(-1px);
}
</style>
