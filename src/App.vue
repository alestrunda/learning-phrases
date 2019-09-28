<template>
  <div id="app">
    <img
      class="bg-image"
      v-for="(image, index) in images"
      v-bind:key="index"
      v-bind:class="{ active: imageIndex === index }"
      v-bind:src="image"
      alt
    >
    <Phrase
      v-if="phrases.length"
      v-bind:phrase="phrases[phraseIndex]"
      v-on:onContinue="increasePhraseIndex"
    />
    <div
      class="phrases-cnt"
    >{{phraseIndex + 1}}/{{phrasesLength}}</div>
    <div class="phrase-tags">
      <ButtonToggle v-bind:key="tag" v-bind:active="phraseTagsSelected.includes(tag)" v-for="tag in phraseTags" v-bind:title="getPhraseTagText(tag)" v-on:onToggle="togglePhraseTag(tag)" />
    </div>
  </div>
</template>

<script>
import phrases from "./phrases.js";
import ButtonToggle from "./components/ButtonToggle.vue";
import Phrase from "./components/Phrase.vue";
import { getPhraseTagText } from "./misc.js";

const BACKGROUND_IMAGES = [
  "images/andyone-26591-unsplash.jpg",
  "images/domenico-loia-310197-unsplash.jpg",
  "images/hieu-vu-minh-91995-unsplash.jpg",
  "images/ivo-rainha-764590-unsplash.jpg",
  "images/lubomyr-myronyuk-606350-unsplash.jpg",
  "images/michael-d-beckwith-609520-unsplash.jpg",
  "images/photo-1520099078215-db50d947d060.jpg",
  "images/rawpixel-323215-unsplash.jpg",
  "images/rawpixel-561415-unsplash.jpg",
  "images/rob-bye-325768-unsplash.jpg",
  "images/sebas-ribas-310260-unsplash.jpg",
  "images/thought-catalog-214785-unsplash.jpg"
];
const BG_SWITCH_PHRASES_CNT = 10;

export default {
  name: "app",
  components: {
    ButtonToggle,
    Phrase
  },
  data: function() {
    return {
      phraseIndex: 0,
      phraseTagsSelected: [],
      images: BACKGROUND_IMAGES,
      imageIndex: 0,
    };
  },
  computed: {
    phrases: function() {
      if(!this.phrasesAll.length) return [];
      if(!this.phraseTagsSelected.length) return this.phrasesAll;
      return this.phrasesAll.filter(phrase => {
        for(let i=0, len=this.phraseTagsSelected.length; i<len; i++) {
          if(phrase.tags && phrase.tags.includes(this.phraseTagsSelected[i])) return true;
        }
        return false;
      });
    },
    phrasesAll: function() {
      //check for duplicates
      const phrasesNoDuplicants = [
        ...new Set(phrases.map(phrase => phrase.phrase))
      ];
      const hasDuplicants = phrasesNoDuplicants.length - phrases.length > 0;
      // eslint-disable-next-line
      console.log(`Duplicates: ${hasDuplicants ? "yes" : "no"}`);
      // eslint-disable-next-line
      hasDuplicants && console.log(this.getDuplicantPhrases(phrases));

      //check for missing translation
      const phrasesNoTranslation = phrases.filter(
        phrase => !phrase.translation
      );
      // eslint-disable-next-line
      console.log(
        `Phrases without translation: ${
          phrasesNoTranslation.length > 0 ? "yes" : "no"
        }`
      );
      // eslint-disable-next-line
      phrasesNoTranslation.length > 0 && console.log(phrasesNoTranslation);

      //check for missimg trailing ./!/?
      const phrasesMissingTrailingChar = phrases.filter(phrase => {
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
      // eslint-disable-next-line
      phrasesMissingTrailingChar.length > 0 && console.log(phrasesMissingTrailingChar);

      return shuffle(phrases);
    },
    phrasesLength: function() {
      return this.phrases.length;
    },
    phraseTags: function() {
      if(!this.phrasesAll) return [];
      return [...new Set(this.phrasesAll.map(phrase => phrase.tags || []).reduce((acc, tags) => acc.concat(tags), []))]
    }
  },
  created: function() {
    this.switchBgImage();
  },
  methods: {
    getPhraseTagText,
    increasePhraseIndex: function() {
      const maxIndex = this.phrases.length - 1;
      if (this.phraseIndex === maxIndex) return;
      this.phraseIndex++;
      if (this.phraseIndex % BG_SWITCH_PHRASES_CNT === 0)
        this.switchBgImage();
    },
    getDuplicantPhrases: function() {
      const phrasesChecked = [];
      return phrases.filter(phrase => {
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
    togglePhraseTag: function(phraseTag) {
      const phraseTagIndex = this.phraseTagsSelected.indexOf(phraseTag);
      this.phraseIndex = 0;
      if(phraseTagIndex >= 0) {
        this.phraseTagsSelected.splice(phraseTagIndex, 1);
      }
      else {
        this.phraseTagsSelected = [...this.phraseTagsSelected, phraseTag];
      }
    }
  }
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

.phrase-tags {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px 100px 0 10px;
  text-align: left;
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
