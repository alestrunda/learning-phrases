<template>
  <button class="button-toggle" v-bind:class="{ active }" v-on:click="handleClick">{{ title }}</button>
</template>

<script>
export default {
  name: "ButtonToggle",
  props: {
    title: String,
    active: Boolean
  },
  methods: {
    handleClick: function() {
      this.$emit("onToggle");
    }
  },
};
</script>

<style scoped>
.button-toggle {
  font-family: "Montserrat", sans-serif;
  font-size: 15px;
  padding: 8px 15px;
  color: #eee;
  background-color: #333;
  border: 0;
  border-radius: 8px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease-out;
  margin-bottom: 10px;
  margin-right: 10px;
}

.button-toggle:hover {
  background-color: #444;
}

.button-toggle.active {
  background-color: #57ef4b;
  color: #333;
}
</style>
