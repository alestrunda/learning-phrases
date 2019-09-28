<template>
  <span class="tag">{{ getPhraseTagText(tag) }}</span>
</template>

<script>
import { getPhraseTagText } from "../misc";

export default {
  methods: {
    getPhraseTagText
  },
  props: {
    tag: String
  }
}
</script>

<style scoped>
.tag {
  display: inline-block;
  background-color: #333;
  color: #fff;
  text-align: center;
  margin-right: 4px;
  margin-bottom: 4px;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 5px;
}
</style>