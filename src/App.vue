<template>
  <div id="app">
    <img
      class="bg-image"
      v-for="(image, index) in images"
      v-bind:key="index"
      v-bind:class="{ active: imageIndex === index }"
      v-bind:src="image"
      alt
    />
    <ButtonToggle
      class="app-settings-toggle"
      title="Settings"
      v-bind:active="isAppSettingsVisibled"
      v-on:onToggle="toggleAppSettings()"
    />
    <Phrase
      v-if="phrases.length"
      v-bind:phrase="phrases[phraseIndex]"
      v-bind:tagTitles="tagTitles"
      v-bind:isPhraseVisible="isPhraseVisible"
      v-bind:shouldPlayAudio="settingsDynamic.audio"
      v-on:onContinue="onContinue"
    />
    <div class="phrases-cnt">{{ phraseIndex + 1 }}/{{ phrasesLength }}</div>
    <div class="app-settings" v-if="isAppSettingsVisibled">
      <div class="container">
        <ButtonToggle
          v-bind:title="settingsDynamic.audio ? 'Audio on' : 'Audio off'"
          v-bind:active="!!settingsDynamic.audio"
          v-if="settingsStatic.audio"
          v-on:onToggle="toggleAudio()"
        />
        <ButtonToggle
          v-bind:key="tag"
          v-bind:active="phraseTagsSelected.includes(tag)"
          v-bind:title="getPhraseTagText(tag, tagTitles)"
          v-for="tag in phraseTags"
          v-on:onToggle="togglePhraseTag(tag)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ButtonToggle from "./components/ButtonToggle.vue";
import Phrase from "./components/Phrase.vue";
import { getPhraseTagText } from "./misc.js";
import {
  BACKGROUND_IMAGES,
  BG_SWITCH_PHRASES_CNT,
  SETTINGS_DEFAULTS,
} from "./settings.js";

import "../node_modules/@fortawesome/fontawesome-free/css/all.min.css";

export default {
  name: "app",
  components: {
    ButtonToggle,
    Phrase,
  },
  data: function() {
    return {
      phrasesJson: [],
      phraseIndex: 0,
      phraseTagsSelected: [],
      images: BACKGROUND_IMAGES,
      imageIndex: 0,
      settingsDynamic: {},
      settingsStatic: {},
      tagTitles: {},
      isAppSettingsVisibled: false,
      isPhraseVisible: false,
    };
  },
  computed: {
    phrases: function() {
      if (!this.phrasesAll.length) return [];
      if (!this.phraseTagsSelected.length) return this.phrasesAll;
      return this.phrasesAll.filter((phrase) => {
        for (let i = 0, len = this.phraseTagsSelected.length; i < len; i++) {
          if (phrase.tags && phrase.tags.includes(this.phraseTagsSelected[i]))
            return true;
        }
        return false;
      });
    },
    phrasesAll: function() {
      if (!this.phrasesJson.length) return [];
      this.runPhraseChecks();
      return shuffle(this.phrasesJson);
    },
    phrasesLength: function() {
      return this.phrases.length;
    },
    phraseTags: function() {
      if (!this.phrasesAll) return [];
      return [
        ...new Set(
          this.phrasesAll
            .map((phrase) => phrase.tags || [])
            .reduce((acc, tags) => acc.concat(tags), [])
        ),
      ];
    },
  },
  created: function() {
    this.switchBgImage();
    this.loadPhrases();
    this.listenKeyPressing();
  },
  methods: {
    getPhraseTagText,
    listenKeyPressing: function() {
      window.addEventListener("keydown", (e) => {
        const SPACE_CHARACTER = " ";
        if (e.key !== SPACE_CHARACTER) return;
        this.onContinue();
      });
    },
    onContinue: function() {
      if (this.isPhraseVisible) {
        this.isPhraseVisible = false;
        this.increasePhraseIndex();
      } else {
        this.isPhraseVisible = true;
      }
    },
    increasePhraseIndex: function() {
      const maxIndex = this.phrases.length - 1;
      if (this.phraseIndex === maxIndex) return;
      this.phraseIndex++;
      if (this.phraseIndex % BG_SWITCH_PHRASES_CNT === 0) this.switchBgImage();
    },
    getDuplicantPhrases: function() {
      const phrasesChecked = [];
      return this.phrasesJson.filter((phrase) => {
        const isDuplicate = phrasesChecked.includes(phrase.phrase);
        phrasesChecked.push(phrase.phrase);
        return isDuplicate;
      });
    },
    switchBgImage: function() {
      if (this.images.length === 1) return;
      const newIndex = Math.floor(Math.random() * (this.images.length - 1)); //decrease available indexes by one to exclude the currect image index
      this.imageIndex = this.imageIndex === newIndex ? newIndex + 1 : newIndex; //if we hit the current index, get the next image
    },
    toggleAppSettings: function() {
      this.isAppSettingsVisibled = !this.isAppSettingsVisibled;
    },
    toggleAudio: function() {
      this.settingsDynamic = {
        ...this.settingsDynamic,
        audio: !this.settingsDynamic.audio,
      };
    },
    togglePhraseTag: function(phraseTag) {
      const phraseTagIndex = this.phraseTagsSelected.indexOf(phraseTag);
      this.phraseIndex = 0;
      if (phraseTagIndex >= 0) {
        this.phraseTagsSelected.splice(phraseTagIndex, 1);
      } else {
        this.phraseTagsSelected = [...this.phraseTagsSelected, phraseTag];
      }
    },
    loadPhrases: function() {
      fetch(process.env.VUE_APP_PHRASES_SOURCE)
        .then((data) => data.json())
        .then((data) => {
          this.phrasesJson = data.phrases;
          const settings = data.settings || {};
          this.settingsDynamic = settings;
          this.settingsStatic = { ...SETTINGS_DEFAULTS, ...settings };
        });
      fetch(process.env.VUE_APP_TAGS_SOURCE)
        .then((data) => data.json())
        .then((data) => {
          this.tagTitles = data;
        });
    },
    runPhraseChecks: function() {
      this.settingsStatic.checkDuplications && this.checkDuplications();
      this.settingsStatic.checkMissingTranslation &&
        this.checkMissingTranslation();
      this.settingsStatic.checkMissingTrailingCharacter &&
        this.checkMissingTrailingCharacter();
    },
    checkMissingTrailingCharacter: function() {
      //check for missimg trailing . / ! / ?
      const phrasesMissingTrailingChar = this.phrasesJson.filter((phrase) => {
        return (
          !isTralingChar(phrase.phrase[phrase.phrase.length - 1]) ||
          !isTralingChar(phrase.translation[phrase.translation.length - 1])
        );
      });
      // eslint-disable-next-line
      console.log(
        `Phrases with missing traling character: ${
          phrasesMissingTrailingChar.length > 0 ? "yes" : "no"
        }`
      );
      phrasesMissingTrailingChar.length > 0 &&
        // eslint-disable-next-line
        console.log(phrasesMissingTrailingChar);
    },
    checkDuplications: function() {
      const phrasesNoDuplicants = [
        ...new Set(this.phrasesJson.map((phrase) => phrase.phrase)),
      ];
      const hasDuplicants =
        phrasesNoDuplicants.length - this.phrasesJson.length > 0;
      // eslint-disable-next-line
      console.log(`Duplicates: ${hasDuplicants ? "yes" : "no"}`);
      // eslint-disable-next-line
      hasDuplicants && console.log(this.getDuplicantPhrases(phrases));
    },
    checkMissingTranslation: function() {
      const phrasesNoTranslation = this.phrasesJson.filter(
        (phrase) => !phrase.translation
      );
      // eslint-disable-next-line
      console.log(
        `Phrases without translation: ${
          phrasesNoTranslation.length > 0 ? "yes" : "no"
        }`
      );
      // eslint-disable-next-line
      phrasesNoTranslation.length > 0 && console.log(phrasesNoTranslation);
    },
  },
};

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isTralingChar(char) {
  return char === "." || char === "?" || char === "!" || char === ")";
}
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  line-height: 1.5;
  color: #2c3e50;
  background-color: #333;
  font-size: 22px;
}

button {
  cursor: pointer;
}

button:focus {
  outline: none;
}

#app {
  position: relative;
  z-index: 1;
  font-family: "Montserrat", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 150px 30px;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: center;
}

.app-settings {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.8);
}

.app-settings-toggle {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 15;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 2s ease-out;
  opacity: 0;
  z-index: -1;
}

.bg-image.active {
  opacity: 0.7;
}

.button-audio {
  font-family: "Montserrat", sans-serif;
  font-size: 17px;
  position: absolute;
  top: 10px;
  left: 10px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background-color: #4b92ef;
  border: 0;
  border-radius: 50%;
  z-index: 1;
  box-shadow: 0 2px 4px 1px rgba(0, 0, 0, 0.4);
}

.button-continue {
  position: relative;
  font-family: "Montserrat", sans-serif;
  font-size: 22px;
  padding: 10px 25px;
  color: #fff;
  background-color: #57ef4b;
  border: 0;
  border-radius: 8px;
  z-index: 1;
}

.button-continue::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.6));
  content: "";
  z-index: -1;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0.6;
  transition: all 0.3s ease-out;
}

.button-continue:hover::after {
  opacity: 0.9;
}

.container {
  padding-left: 20px;
  padding-right: 20px;
}

.phrases-cnt {
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 16px;
  color: #fff;
  letter-spacing: 2px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.text-center {
  text-align: center;
}
</style>
