<script setup lang="ts">

</script>

<template>
  <section class='hero grid paginated' aria-label='Hero'>
    <div class='grid-item-1'>
      <h1>
        <span>C</span>
        <span>o</span>
        <span class='breathe'>u</span>
        <span>n</span>
        <span class='breathe'>t</span>
        <span class='breathe'>e</span>
        <span class='breathe'>r</span>
        <strong> / </strong>
        <span>R</span>
        <span>a</span>
        <span>d</span>
        <span class='breathe'>i</span>
        <span class='breathe'>c</span>
        <span class='breathe'>a</span>
        <span class='breathe'>l</span>
        <span class='breathe'>i</span>
        <span class='breathe'>z</span>
        <span class='breathe'>e</span>
      </h1>
    </div>
    <div class='grid-item-2'>
      <p>An experimental tool to analyze and visualize emotional content in speech.</p>
      <a class='button' href='#about'>Dig deeper</a>
    </div>
  </section>
</template>

<style scoped>
.hero {
  grid-template-areas: '. t s';
  grid-template-columns: 0.25fr 0.8fr 1.1fr;
}
h1 {
  font-size: 4.5rem;
  font-feature-settings: 'kern' 0;
  font-variation-settings: 'wght' 600;
  cursor: crosshair;
  line-height: 1.1;
  margin: 0;
  animation: disable 4s backwards;
}
.grid-item-1 {
  grid-area: t;
}
.grid-item-2 {
  grid-area: s;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  gap: 1.5rem;
}
p {
  font-size: 1.2rem;
  text-wrap: balance;
  margin: 0;
}
h1 span {
  transition: font-variation-settings 1s ease;
}
h1 span:hover,
h1 span:hover + span,
h1 span:has(+ span:hover) {
  font-variation-settings: 'wght' 300;
}
.breathe {
  animation: letter-breathe 3s ease 1s;
}
@keyframes disable {
  from { pointer-events: none; }
  to { pointer-events: none; }
}
@keyframes letter-breathe {
  from { font-variation-settings: 'wght' 600; }
  45% { font-variation-settings: 'wght' 200; }
  60% { font-variation-settings: 'wght' 200; }
  to { font-variation-settings: 'wght' 600; }
}
@media screen and (max-width: 1024px) {
  .hero {
    grid-template-areas:
    't'
    's';
    grid-template-columns: 1fr;
  }
  h1 {
    font-size: 3.7rem;
    text-align: center;
  }
  .grid-item-1 {
    justify-self: center;
    align-self: end;
  }
  .grid-item-2 {
    align-self: start;
    gap: 3rem;
  }
}
</style>
