<template>
  <div class="phrase">
    <div class="phrase__tags">
      <Tag v-bind:key="tag" v-bind:tag="tag" v-bind:tagTitles="tagTitles" v-for="tag in phrase.tags" />
    </div>
    <div class="text-center">
      <p>{{ phrase.translation }}</p>
      <p class="phrase__note">{{ phrase.note }}</p>
      <div class="phrase__toggle" v-bind:class="{ active: isPhraseVisible }">
        <hr>
        <p>{{ phrase.phrase }}</p>
      </div>
      <button class="button-audio" v-if="shouldPlayAudio && isPhraseVisible" v-on:click="onPlay"><i class="fas fa-volume-up"></i></button>
      <div class="space"/>
      <button class="button-continue" v-on:click="onContinue">{{ isPhraseVisible ? "Continue" : "Show phrase" }}</button>
    </div>
  </div>
</template>

<script>
import Tag from "./Tag";

export default {
  name: "Phrase",
  components: {
    Tag
  },
  props: {
    phrase: Object,
    tagTitles: Object,
    isPhraseVisible: Boolean,
    shouldPlayAudio: Boolean
  },
  created: function() {
    this.initAudio();
  },
  methods: {
    initAudio: function() {
      this.resetAudio();
      const audio = new Audio();
      audio.oncanplay = () => {
        this.audio = audio;
      }
      audio.src = `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${this.parseAudioString(this.phrase.phrase)}--_gb_1.mp3`;
    },
    resetAudio: function() {
      this.audio = undefined;
    },
    parseAudioString: function(phrase) {
      const regRemoveBrackets = /(\(.+\))?\s?(.*)/g;
      const parts = regRemoveBrackets.exec(phrase);
      const phraseWithoutBrackets = parts[parts.length - 1];
      return phraseWithoutBrackets.split(" ")[0]
    },
    playAudio: function() {
      if(this.audio) this.audio.play()
    },
    onContinue: function() {
      if(!this.isPhraseVisible) this.playAudio()
      this.$emit("onContinue");
    },
    onPlay: function() {
      this.playAudio()
    }
  },
  watch: {
    isPhraseVisible: function(isVisible) {
      if(isVisible) this.playAudio()
    },
    phrase: function() {
      this.initAudio();
    }
  }
};
</script>

<style scoped>
.phrase {
  position: relative;
  width: 100%;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  background-color: #fff;
  padding: 20px 30px 30px;
  border-radius: 10px;
  box-shadow: 0 5px 5px rgba(0, 0, 0, 0.5);
}
.phrase__note {
  font-size: 16px;
  color: #999;
}
.phrase__tags {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 5px;
  font-size: 10px;
}
.phrase__toggle {
  opacity: 0;
  visibility: hidden;
}
.phrase__toggle.active {
  transition: all 0.5s ease-out;
  opacity: 1;
  visibility: visible;
}
.space {
  height: 10px;
}
</style>
