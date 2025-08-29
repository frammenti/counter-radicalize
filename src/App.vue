<script setup lang='ts'>
import { provide } from 'vue'
import Header from './sections/Header.vue'
import Hero from './sections/Hero.vue'
import About from './sections/About.vue'
import Transcript from './sections/Transcript.vue'
import LinguisticFeatures from './sections/LinguisticFeatures.vue'
import Footer from './sections/Footer.vue'
import previews from './stores/previews.json'

provide('previews', previews)
</script>

<template>
  <Header />
  <main>
    <div class='landing'>
      <Hero />
    </div>
    <About />
    <Transcript />
    <LinguisticFeatures />
  </main>
  <Footer />
</template>

<style scoped lang='scss'>
$schemes: (light, dark);

$breakpoints: (
  mobile: 0,
  tablet: 768px,
  desktop: 1280px
);

$resolutions: (
  1x: '',
  2x: '@2x'
);

@mixin set-background($selector) {
  @each $scheme in $schemes {
    @each $break, $min-width in $breakpoints {
      @each $res, $suffix in $resolutions {
        $file: 'bg-#{$break}-#{$scheme}#{$suffix}.webp';

        // Base query: preferred color scheme
        $queries: '(prefers-color-scheme: #{$scheme})';

        // Append breakpoint if not on mobile
        @if $min-width != 0 {
          $queries: '#{$queries} and (min-width: #{$min-width})';
        }

        // Append resolution for retina screens
        @if $res == 2x {
          $queries: '#{$queries} and (min-resolution: 2dppx)';
        }

        @media #{$queries} {
          #{$selector} {
            background-image: url('./assets/images/#{$file}');
          }
        }
      }
    }
  }
}

.landing {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 100%;
}

@include set-background('.landing');
</style>
